import { NextRequest, NextResponse } from "next/server";

// export function middleware(req: NextRequest) {
//   const aff = req.nextUrl.searchParams.get("ref");
//   console.log("Middleware triggered for:", req.nextUrl.pathname);
//   if (!aff) return NextResponse.next();

//   const isProd = process.env.NODE_ENV === "production";
//   const res = NextResponse.next();
//   console.log("Setting affiliate cookie:", aff, "isProd:", isProd);

//   console.log(isProd);
//   res.cookies.set({
//     name: "affiliate_id",
//     value: aff.slice(0, 100),
//     httpOnly: true,
//     sameSite: "lax",
//     secure: isProd,        // false on localhost (HTTP)
//     path: "/",             // visible to all paths
//     // IMPORTANT: no "domain" on localhost
//     // In prod you can do: domain: ".auraasync.in"
//     ...(isProd ? { domain: ".auraasync.in" } : {}),
//     maxAge: 60 * 60 * 24 * 30,
//   });

//   return res;
// }

// // export const config = {
// //   matcher: '/',
// // };

export function middleware(req: NextRequest) {
  const aff = req.nextUrl.searchParams.get("ref");
  console.log("Middleware triggered for:", req.nextUrl.pathname);
  console.log("Query params:", req.nextUrl.searchParams.toString());
  
  if (!aff) {
    console.log("No 'ref' parameter found");
    return NextResponse.next();
  }

  const isProd = process.env.NODE_ENV === "production";
  const res = NextResponse.next();

  console.log("Setting affiliate cookie:", aff, "isProd:", isProd);
  console.log("NODE_ENV:", process.env.NODE_ENV);

res.cookies.set({
  name: "affiliate_id",
  value: aff.slice(0, 100),
  httpOnly: true,
  sameSite: isProd ? "none" : "lax",  // "none" in prod, "lax" locally
  secure: isProd,                      // true in prod, false locally
  path: "/",
  ...(isProd ? { domain: ".auraasync.in" } : {}),
  maxAge: 60 * 60 * 24 * 30,
});

  console.log("Cookie set successfully");
  return res;
}