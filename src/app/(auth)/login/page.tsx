'use client';

import React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { signIn } from "next-auth/react";

const LoginPage = () => {
  const router = useRouter();
  return (
    <div className="min-h-screen flex items-center justify-center bg-secondary py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center font-serif text-display text-primary">
            Sign in to your account
          </h2>
        </div>
        <form className="mt-8 space-y-6" action="#" method="POST">
          <input type="hidden" name="remember" defaultValue="true" />
          <div className="rounded-md shadow-sm -space-y-px">
            <div>
              <label htmlFor="email-address" className="sr-only">Email address</label>
              <input
                id="email-address"
                name="email"
                type="email"
                autoComplete="email"
                required
                className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-primary rounded-t-md focus:outline-none focus:ring-accent focus:border-accent focus:z-10 sm:text-sm"
                placeholder="Email address"
              />
            </div>
            <div>
              <label htmlFor="password" className="sr-only">Password</label>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                required
                className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-primary rounded-b-md focus:outline-none focus:ring-accent focus:border-accent focus:z-10 sm:text-sm"
                placeholder="Password"
              />
            </div>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <input
                id="remember-me"
                name="remember-me"
                type="checkbox"
                className="h-4 w-4 text-accent focus:ring-accent border-gray-300 rounded"
              />
              <label htmlFor="remember-me" className="ml-2 block text-sm text-primary/80">
                Remember me
              </label>
            </div>

            <div className="text-sm">
              <Link href="#" className="font-medium text-accent hover:text-accent-dark">
                Forgot your password?
              </Link>
            </div>
          </div>

          <div>
            <button
              type="submit"
              className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-primary hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
            >
              <span className="absolute left-0 inset-y-0 flex items-center pl-3">
                {/* Heroicon name: solid/lock-closed */}
                {/* <svg className="h-5 w-5 text-primary group-hover:text-primary/80" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                  <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                </svg> */}
              </span>
              Sign in
            </button>
          </div>
        </form>

        <div className="text-center text-sm text-primary/80">
          Or <Link href="/signup" className="font-medium text-accent hover:text-accent-dark">start your free trial</Link>
        </div>

        <div className="mt-4">
          <button
            onClick={() => signIn("google")}
            className="bg-white text-black px-6 py-3 rounded shadow font-bold text-lg hover:bg-gray-200 transition"
          >
            Sign in with Google
          </button>
        </div>

        {/* Temporary testing button to navigate to analysis flow */}
        <div className="mt-2">
          <button
            onClick={() => router.push('/analysis-v2/force')}
            className="w-full px-6 py-3 rounded bg-accent text-white font-semibold hover:bg-accent/90 transition"
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
};

export default LoginPage; 