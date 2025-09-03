"use client";
import React, { useState } from "react";
import { useRouter } from "next/navigation";

export default function FeedbackPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const subject = encodeURIComponent("Auraasync Feedback");
    const body = encodeURIComponent(`Name: ${name}\nEmail: ${email}\n\n${message}`);
    window.location.href = `mailto:auraasync@gmail.com?subject=${subject}&body=${body}`;
  };

  return (
    <div className="min-h-screen bg-[#251F1E] text-white px-4 py-10">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-semibold mb-6">We value your feedback</h1>
        <p className="mb-8 text-white/80">Tell us what you think about Auraasync or what we can improve.</p>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block mb-2 text-sm">Name</label>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full rounded-lg border border-white/20 bg-white/10 px-4 py-2 outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Your name"
              required
            />
          </div>
          <div>
            <label className="block mb-2 text-sm">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full rounded-lg border border-white/20 bg-white/10 px-4 py-2 outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="you@example.com"
              required
            />
          </div>
          <div>
            <label className="block mb-2 text-sm">Message</label>
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              className="w-full min-h-[160px] rounded-lg border border-white/20 bg-white/10 px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Share your thoughts..."
              required
            />
          </div>
          <div className="flex items-center gap-3">
            <button type="submit" className="px-5 py-2 rounded-lg bg-blue-600 hover:bg-blue-700">Send Feedback</button>
            <button type="button" onClick={() => router.back()} className="px-5 py-2 rounded-lg border border-white/20 hover:bg-white/10">Cancel</button>
          </div>
        </form>
      </div>
    </div>
  );
}


