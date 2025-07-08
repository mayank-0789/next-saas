"use client"
import Image from "next/image";
import { signIn, signOut, useSession, SessionProvider } from "next-auth/react";
import Appbar from "@/app/components/Appbar";

export default function Home() {
  return (
    <div>
      <Appbar/>
    </div>
  );
}
