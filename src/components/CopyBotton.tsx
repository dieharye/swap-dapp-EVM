"use client";
import { useState } from "react";
import {Copy, Check} from 'lucide-react'

export default function CopyButton({ value }: any) {
  const [copied, setCopied] = useState(false);

  const copyContent = async (value: any) => {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
    } catch (error) {
      console.log(error);
    }
    setTimeout(() => {
      setCopied(false);
    }, 1000);
  };
  return !copied ? (
    <Copy
      onClick={() => {
        copyContent(value);
      }}
    />
  ) : (
    <Check size={15} />
  );
}
