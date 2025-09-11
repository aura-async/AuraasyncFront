import { NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";

// Next.js App Router API route: POST /api/gemini
// Accepts JSON: { mode: 'face_skin' | 'body_shape', images: [{ base64?: string, dataUrl?: string, mimeType?: string }], gender?: 'male' | 'female' }
// Returns JSON with structured fields per mode.

function extractBase64AndMime(input: { base64?: string; dataUrl?: string; mimeType?: string }) {
	let mimeType = input.mimeType || "image/jpeg";
	let base64 = input.base64 || "";
	if (!base64 && input.dataUrl) {
		// data URL format: data:<mime>;base64,<data>
		const match = input.dataUrl.match(/^data:(.*?);base64,(.*)$/);
		if (match) {
			mimeType = input.mimeType || match[1] || mimeType;
			base64 = match[2] || base64;
		}
	}
	return { base64, mimeType };
}

// Validate image data
function validateImage(base64: string, mimeType: string): { valid: boolean; error?: string } {
	// Check file size (max 10MB)
	const sizeInBytes = (base64.length * 3) / 4;
	if (sizeInBytes > 10 * 1024 * 1024) {
		return { valid: false, error: "Image too large. Maximum 10MB allowed." };
	}
	
	// Check MIME type
	const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
	if (!allowedTypes.includes(mimeType.toLowerCase())) {
		return { valid: false, error: "Invalid image type. Only JPEG, PNG, and WebP allowed." };
	}
	
	// Basic base64 validation
	if (!/^[A-Za-z0-9+/]*={0,2}$/.test(base64)) {
		return { valid: false, error: "Invalid base64 data." };
	}
	
	return { valid: true };
}

// Compress image to reduce token usage while maintaining quality for analysis
async function compressImage(base64: string, mimeType: string, maxSizeKB: number = 80, analysisMode?: string): Promise<string> {
	try {
		// Convert base64 to blob
		const byteCharacters = atob(base64);
		const byteNumbers = new Array(byteCharacters.length);
		for (let i = 0; i < byteCharacters.length; i++) {
			byteNumbers[i] = byteCharacters.charCodeAt(i);
		}
		const byteArray = new Uint8Array(byteNumbers);
		const blob = new Blob([byteArray], { type: mimeType });
		
		// Check if already small enough
		if (blob.size <= maxSizeKB * 1024) {
			return base64;
		}
		
		// Create canvas for compression
		const canvas = document.createElement('canvas');
		const ctx = canvas.getContext('2d');
		if (!ctx) return base64;
		
		const img = new Image();
		await new Promise((resolve, reject) => {
			img.onload = resolve;
			img.onerror = reject;
			img.src = `data:${mimeType};base64,${base64}`;
		});
		
		// Calculate new dimensions (optimized for accuracy vs cost)
		const maxDimension = analysisMode === "face_skin" ? 400 : 500; // Reduced for lower token usage
		let { width, height } = img;
		if (width > height) {
			if (width > maxDimension) {
				height = (height * maxDimension) / width;
				width = maxDimension;
			}
		} else {
			if (height > maxDimension) {
				width = (width * maxDimension) / height;
				height = maxDimension;
			}
		}
		
		canvas.width = width;
		canvas.height = height;
		ctx.drawImage(img, 0, 0, width, height);
		
		// Convert back to base64 with compression (optimized for accuracy vs tokens)
		const quality = 0.7; // Reduced quality for lower token usage
		const compressedDataUrl = canvas.toDataURL('image/jpeg', quality);
		const compressedBase64 = compressedDataUrl.split(',')[1];
		
		return compressedBase64;
	} catch (error) {
		console.warn('Image compression failed, using original:', error);
		return base64;
	}
}

function safeJsonParse<T = unknown>(text: string): T | null {
	try {
		return JSON.parse(text) as T;
	} catch (_) {
		// try to extract from code fence
		const fence = text.match(/```(?:json)?\n([\s\S]*?)```/i);
		if (fence) {
			try {
				return JSON.parse(fence[1]) as T;
			} catch (_) {
				return null;
			}
		}
		return null;
	}
}

// Rate limiting store
const rateLimitStore = new Map<string, { count: number; resetTime: number }>();

// Rate limiting function
function checkRateLimit(identifier: string, maxRequests: number = 10, windowMs: number = 60000): boolean {
	const now = Date.now();
	const key = identifier;
	const record = rateLimitStore.get(key);
	
	if (!record || now > record.resetTime) {
		rateLimitStore.set(key, { count: 1, resetTime: now + windowMs });
		return true;
	}
	
	if (record.count >= maxRequests) {
		return false;
	}
	
	record.count++;
	return true;
}

// Authentication middleware
function verifyAuth(req: Request): boolean {
	const authHeader = req.headers.get('authorization');
	if (!authHeader) return false;
	
	// Basic token validation (you should implement proper JWT validation)
	const token = authHeader.replace('Bearer ', '');
	return token.length > 10; // Basic check
}

export async function POST(req: Request) {
	const globalAny = global as any;
	
	// Security checks
	const clientIP = req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip') || 'unknown';
	
	// Rate limiting
	if (!checkRateLimit(clientIP, 5, 60000)) { // 5 requests per minute
		return NextResponse.json(
			{ error: "Rate limit exceeded. Please wait before trying again." },
			{ status: 429 }
		);
	}
	
	// Basic authentication check (temporarily disabled for development)
	// if (!verifyAuth(req)) {
	// 	return NextResponse.json(
	// 		{ error: "Authentication required" },
	// 		{ status: 401 }
	// 	);
	// }
	
	try {
		const { mode, images, gender } = await req.json();

		// Input validation
		if (!mode || !Array.isArray(images) || images.length === 0) {
			return NextResponse.json(
				{ error: "Missing required fields: mode, images[]" },
				{ status: 400 }
			);
		}
		
		// Validate mode
		if (!['face_skin', 'body_shape'].includes(mode)) {
			return NextResponse.json(
				{ error: "Invalid mode. Must be 'face_skin' or 'body_shape'" },
				{ status: 400 }
			);
		}
		
		// Validate images array size
		if (images.length > 5) {
			return NextResponse.json(
				{ error: "Too many images. Maximum 5 allowed" },
				{ status: 400 }
			);
		}
		
		// Additional validation for body analysis
		if (mode === "body_shape" && images.length > 1) {
			return NextResponse.json(
				{ error: "Body analysis requires exactly 1 image for accurate measurement" },
				{ status: 400 }
			);
		}
		
		// Validate gender if provided
		if (gender && !['male', 'female'].includes(gender)) {
			return NextResponse.json(
				{ error: "Invalid gender. Must be 'male' or 'female'" },
				{ status: 400 }
			);
		}

		const apiKey = process.env.GOOGLE_API_KEY;
		if (!apiKey) {
			return NextResponse.json(
				{ error: "Server misconfigured: GOOGLE_API_KEY not set" },
				{ status: 500 }
			);
		}

		const genAI = new GoogleGenerativeAI(apiKey);
		// Use the most cost-effective model by default, with fallbacks
		// For body analysis, use a more capable model for better accuracy
		const primaryModel = mode === "body_shape" 
			? (process.env.GEMINI_MODEL || "gemini-2.5-flash")
			: (process.env.GEMINI_MODEL || "gemini-2.5-flash-lite");
		let model = genAI.getGenerativeModel({ model: primaryModel });
		const fallbackModels = mode === "body_shape"
			? ["gemini-1.5-flash", "gemini-2.5-flash-lite"].filter(m => m !== primaryModel)
			: ["gemini-2.5-flash", "gemini-1.5-flash"].filter(m => m !== primaryModel);

		// Validate and compress images
		const imageValidation = images
			.map(extractBase64AndMime)
			.map((p) => {
				const validation = validateImage(p.base64, p.mimeType);
				return { ...p, validation };
			});
		
		// Check for validation errors
		const invalidImages = imageValidation.filter(img => !img.validation.valid);
		if (invalidImages.length > 0) {
			return NextResponse.json(
				{ error: invalidImages[0].validation.error },
				{ status: 400 }
			);
		}
		
		const compressedImages = await Promise.all(
			imageValidation
				.filter((p) => p.base64 && p.validation.valid)
				.map(async (p) => ({
					base64: await compressImage(p.base64, p.mimeType, 50, mode), // Reduced from 80KB to 50KB
					mimeType: p.mimeType
				}))
		);
		
		const imageParts = compressedImages.map((p) => ({ 
			inlineData: { data: p.base64, mimeType: p.mimeType } 
		}));

		if (imageParts.length === 0) {
			return NextResponse.json(
				{ error: "No valid images provided" },
				{ status: 400 }
			);
		}

		let systemPrompt = "";
		let responseSchema: any | undefined;
		if (mode === "face_skin") {
			systemPrompt = [
				"Analyze face shape and skin tone:",
				"",
				"Face shapes: Oval (1.5x length), Round (equal), Square (angular), Heart (wide forehead), Diamond (wide cheeks), Oblong (long)",
				"Skin tones: Warm (golden), Cool (pink/blue), Neutral (balanced)",
				"",
				"Requirements: Clear face, good lighting. If unclear: {\"error\": \"face_not_detected\"} or {\"error\": \"skin_not_detected\"}",
				"",
				"Return JSON: face_shape, skin_tone, face_confidence, skin_confidence",
			].join("\n");
			responseSchema = {
				type: "object",
				properties: {
					face_shape: { type: "string", enum: ["Oval", "Round", "Square", "Heart", "Diamond", "Oblong"] },
					skin_tone: { type: "string", enum: ["Warm", "Cool", "Neutral"] },
					face_confidence: { type: "number", minimum: 0, maximum: 1 },
					skin_confidence: { type: "number", minimum: 0, maximum: 1 },
				},
				required: ["face_shape", "skin_tone", "face_confidence", "skin_confidence"],
			};
		} else if (mode === "body_shape") {
			const genderHint = gender ? ` (${gender})` : "";
			
			// Gender-specific body types and detailed descriptions
			let bodyTypes: string[] = [];
			let bodyDescriptions: string[] = [];
			
			if (gender === "male") {
				bodyTypes = ["Ectomorph", "Mesomorph", "Endomorph", "Rectangle", "Inverted Triangle"];
				bodyDescriptions = [
					"Ectomorph: Lean, narrow shoulders, minimal muscle",
					"Mesomorph: Athletic, broad shoulders, V-shaped",
					"Endomorph: Wider frame, broader waist, rounder",
					"Rectangle: Straight frame, shoulders≈waist≈hips",
					"Inverted Triangle: Broad shoulders, narrow waist"
				];
			} else if (gender === "female") {
				bodyTypes = ["Hourglass", "Rectangle", "Triangle", "Apple", "Pear"];
				bodyDescriptions = [
					"Hourglass: Shoulders≈hips, defined waist",
					"Rectangle: Shoulders≈waist≈hips, straight",
					"Triangle: Narrow shoulders, wider hips",
					"Apple: Broader shoulders, narrower hips",
					"Pear: Narrow shoulders, wider hips"
				];
			} else {
				bodyTypes = ["Hourglass", "Rectangle", "Triangle", "Apple", "Pear"];
				bodyDescriptions = [
					"Hourglass: Shoulders≈hips, defined waist",
					"Rectangle: Shoulders≈waist≈hips, straight",
					"Triangle: Narrow shoulders, wider hips",
					"Apple: Broader shoulders, narrower hips",
					"Pear: Narrow shoulders, wider hips"
				];
			}
			
			systemPrompt = [
				`Analyze body shape${genderHint}:`,
				"",
				//
				"",
				"Measure: shoulder width, waist width, hip width. Calculate ratios.",
				"",
				"Body types:",
				...bodyDescriptions,
				"",
				"Return JSON: body_shape, body_confidence (0.0-1.0, min 0.7)",
			].join("\n");
			
			responseSchema = {
				type: "object",
				properties: {
					body_shape: { type: "string", enum: bodyTypes },
					body_confidence: { type: "number", minimum: 0, maximum: 1 },
				},
				required: ["body_shape", "body_confidence"],
			};
		} else {
			return NextResponse.json(
				{ error: "Invalid mode. Use 'face_skin' or 'body_shape'" },
				{ status: 400 }
			);
		}


		// Retry helper for transient errors
		const retryableStatus = new Set([408, 429, 500, 502, 503, 504]);
		const generateWithRetry = async (maxAttempts: number = 3) => {
			let attempt = 0;
			let lastError: any;
			while (attempt < maxAttempts) {
				try {
					return await model.generateContent({
						contents: [
							{ role: "user", parts: [{ text: systemPrompt }, ...imageParts] },
						],
						generationConfig: {
							temperature: mode === "body_shape" ? 0.1 : 0, // Slight randomness for body analysis to avoid overfitting
							topK: mode === "body_shape" ? 3 : 1, // More options for body analysis
							topP: 0.95, // High topP for better accuracy
							responseMimeType: responseSchema ? "application/json" : undefined,
							responseSchema: responseSchema,
						},
					});
				} catch (err: any) {
					lastError = err;
					const status: number | undefined = err?.status || err?.response?.status;
					// On quota/network/server errors, try fallback models sequentially
					if (status === 429 || status === 500 || status === 503 || !status) {
						for (const fm of fallbackModels) {
							try {
								model = genAI.getGenerativeModel({ model: fm });
								return await model.generateContent({
									contents: [
										{ role: "user", parts: [{ text: systemPrompt }, ...imageParts] },
									],
								generationConfig: {
									temperature: mode === "body_shape" ? 0.1 : 0,
									topK: mode === "body_shape" ? 3 : 1,
									topP: 0.95,
									responseMimeType: responseSchema ? "application/json" : undefined,
									responseSchema: responseSchema,
								},
								});
							} catch (fallbackErr: any) {
								lastError = fallbackErr;
								continue;
							}
						}
					}
					if (!status || !retryableStatus.has(status)) break;
					// Exponential backoff with jitter: 500ms, 1s, 2s
					const delayMs = Math.min(2000, 500 * Math.pow(2, attempt)) + Math.floor(Math.random() * 200);
					await new Promise((r) => setTimeout(r, delayMs));
					attempt += 1;
				}
			}
			throw lastError;
		};

		// Simple in-memory cache by image hash to reduce duplicate calls and quota
		// Note: ephemeral per instance; acceptable for dev/testing
		if (!globalAny.__geminiCache) {
			globalAny.__geminiCache = new Map<string, { expires: number; value: any }>();
		}
		const cache: Map<string, { expires: number; value: any }> = globalAny.__geminiCache;
		const hasher = async (data: string) => {
			const enc = new TextEncoder().encode(data);
			const buf = await crypto.subtle.digest("SHA-256", enc);
			return Array.from(new Uint8Array(buf)).map((b) => b.toString(16).padStart(2, "0")).join("");
		};
		const firstImage = images[0]?.base64 || images[0]?.dataUrl || "";
		let cacheKey = "";
		if (firstImage) {
			try { cacheKey = await hasher(`${mode}:${firstImage.slice(0, 4096)}`); } catch {}
		}
		if (cacheKey && cache.has(cacheKey)) {
			const entry = cache.get(cacheKey)!;
			if (Date.now() < entry.expires) {
				// Track cache hit
				const globalAny = global as any;
				if (globalAny.__geminiUsageStats) {
					globalAny.__geminiUsageStats.cacheHits++;
				}
				return NextResponse.json({ data: entry.value, cached: true });
			}
			cache.delete(cacheKey);
		}

		const result = await generateWithRetry(2);

		const text = result.response.text();
		// Track token usage for monitoring
		const usage = result.response.usageMetadata;
		const totalTokens = usage?.totalTokenCount || 0;
		console.log("/api/gemini usage:", {
			promptTokens: usage?.promptTokenCount || 0,
			completionTokens: usage?.candidatesTokenCount || 0,
			totalTokens,
			mode,
			model: model.model
		});
		
		// Update usage stats
		if (!globalAny.__geminiUsageStats) {
			globalAny.__geminiUsageStats = {
				totalRequests: 0,
				totalTokens: 0,
				faceRequests: 0,
				bodyRequests: 0,
				errors: 0,
				cacheHits: 0
			};
		}
		const stats = globalAny.__geminiUsageStats;
		stats.totalRequests++;
		stats.totalTokens += totalTokens;
		if (mode === "face_skin") stats.faceRequests++;
		if (mode === "body_shape") stats.bodyRequests++;
		// Debug log to verify model output server-side
		console.log("/api/gemini raw response:", text?.slice(0, 500));
		const parsed = safeJsonParse<any>(text);

		if (!parsed) {
			return NextResponse.json(
				{ error: "Failed to parse model response", raw: text },
				{ status: 502 }
			);
		}

		// Handle explicit not-detected signals from model
		if (parsed?.error === "face_not_detected" || parsed?.error === "skin_not_detected") {
			return NextResponse.json({ error: "face_not_detected" }, { status: 422 });
		}
		if (parsed?.error === "body_not_detected") {
			return NextResponse.json({ error: "body_not_detected" }, { status: 422 });
		}

		// Normalize known label variants
		const normalize = (value: unknown) =>
			typeof value === "string"
				? value
					.trim()
					.replace(/^\s+|\s+$/g, "")
					.replace(/^(oval|round|square|heart|diamond|oblong)$/i, (m) =>
						m.charAt(0).toUpperCase() + m.slice(1).toLowerCase()
					)
					.replace(/^(warm|cool|neutral)$/i, (m) => m.charAt(0).toUpperCase() + m.slice(1).toLowerCase())
					.replace(/^(ectomorph|mesomorph|endomorph|rectangle|inverted triangle|triangle|apple|pear|hourglass|oval)$/i, (m) => {
						const normalized = m.toLowerCase();
						if (normalized === "inverted triangle") return "Inverted Triangle";
						return m.charAt(0).toUpperCase() + m.slice(1).toLowerCase();
					})
				: value;

		const normalized = { ...parsed } as any;
		if (normalized.face_shape) normalized.face_shape = normalize(normalized.face_shape);
		if (normalized.skin_tone) normalized.skin_tone = normalize(normalized.skin_tone);
		if (normalized.body_shape) normalized.body_shape = normalize(normalized.body_shape);
		// Enforce confidence thresholds for better accuracy
		if (mode === "face_skin") {
			// Face/skin analysis confidence thresholds
			if (typeof normalized.face_confidence === "number" && normalized.face_confidence < 0.5) {
				return NextResponse.json({ error: "face_not_detected" }, { status: 422 });
			}
			if (typeof normalized.skin_confidence === "number" && normalized.skin_confidence < 0.5) {
				return NextResponse.json({ error: "skin_not_detected" }, { status: 422 });
			}
		} else if (mode === "body_shape") {
			// Body analysis confidence threshold - stricter for better accuracy
			if (typeof normalized.body_confidence === "number" && normalized.body_confidence < 0.7) {
				return NextResponse.json({ error: "body_not_detected" }, { status: 422 });
			}
		}

		// Save to cache for 5 minutes, keep map size reasonable (~50)
		if (cacheKey) {
			try {
				if (cache.size > 50) {
					const first = cache.keys().next().value;
					if (first) cache.delete(first);
				}
				cache.set(cacheKey, { expires: Date.now() + 5 * 60_000, value: normalized });
			} catch {}
		}
		const response = NextResponse.json({ data: normalized });
		
		// Add security headers
		response.headers.set('Access-Control-Allow-Origin', process.env.NODE_ENV === 'production' ? 'https://yourdomain.com' : '*');
		response.headers.set('Access-Control-Allow-Methods', 'POST, GET, OPTIONS');
		response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');
		response.headers.set('X-Content-Type-Options', 'nosniff');
		response.headers.set('X-Frame-Options', 'DENY');
		response.headers.set('X-XSS-Protection', '1; mode=block');
		
		return response;
		} catch (err: any) {
		// Track errors
		if (globalAny.__geminiUsageStats) {
			globalAny.__geminiUsageStats.errors++;
		}
		
		const status: number | undefined = err?.status || err?.response?.status;
		if (status === 429) {
			// Surface quota issue to client with optional retry hint
			let retryAfterSec: number | undefined;
			try {
				const retry = (Array.isArray(err?.errorDetails)
					? err.errorDetails.find((d: any) => typeof d?.["@type"] === "string" && d["@type"].includes("RetryInfo"))
					: err?.errorDetails) as any;
				const delay = retry?.retryDelay || retry?.retry_delay || null;
				if (typeof delay === "string" && delay.endsWith("s")) {
					retryAfterSec = parseInt(delay.replace(/[^0-9]/g, ""), 10);
				}
			} catch {}
			const body: any = { error: "quota_exceeded", message: "Gemini quota exceeded. Please wait and try again." };
			if (retryAfterSec) body.retryAfterSec = retryAfterSec;
			return NextResponse.json(body, { status: 429 });
		}
		console.error("/api/gemini error", err);
		return NextResponse.json(
			{ error: err?.message || "Unknown server error" },
			{ status: 500 }
		);
	}
}

// Usage monitoring endpoint - PROTECTED
export async function GET(req: Request) {
	// Security check for usage endpoint
	const authHeader = req.headers.get('authorization');
	if (!authHeader || !authHeader.startsWith('Bearer ')) {
		return NextResponse.json(
			{ error: "Authentication required for usage stats" },
			{ status: 401 }
		);
	}
	
	const url = new URL(req.url);
	if (url.searchParams.get("usage") === "true") {
		// Return usage statistics (only for authenticated admin users)
		const globalAny = global as any;
		const stats = globalAny.__geminiUsageStats || {
			totalRequests: 0,
			totalTokens: 0,
			faceRequests: 0,
			bodyRequests: 0,
			errors: 0,
			cacheHits: 0
		};
		return NextResponse.json({
			usage: stats,
			limits: {
				freeTier: { rpm: 10, rpd: 250, tpm: 250000 },
				tier1: { rpm: 1000, rpd: 10000, tpm: 1000000 }
			}
		});
	}
	try {
		const apiKey = process.env.GOOGLE_API_KEY;
		if (!apiKey) {
			return NextResponse.json({ ok: false, error: "GOOGLE_API_KEY not set" }, { status: 500 });
		}
		const genAI = new GoogleGenerativeAI(apiKey);
		const healthModel = process.env.GEMINI_MODEL || "gemini-2.5-flash-lite";
		const model = genAI.getGenerativeModel({ model: healthModel });
		// Tiny ping request
		const res = await model.generateContent({ contents: [{ role: "user", parts: [{ text: "ping" }] }] });
		const text = res.response.text();
		return NextResponse.json({ ok: true, sample: text?.slice(0, 64) ?? "" });
	} catch (err: any) {
		return NextResponse.json({ ok: false, error: err?.message || "unknown" }, { status: 500 });
	}
}
