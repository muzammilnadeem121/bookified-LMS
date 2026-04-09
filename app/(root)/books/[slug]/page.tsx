import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, MicOff, Mic } from "lucide-react";

import { getBookBySlug } from "@/lib/actions/book.actions";
import VapiControls from "@/components/VapiControls";
import { useClerk } from "@clerk/nextjs";

export default async function BookDetailsPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {

  const { slug } = await params;
  const result = await getBookBySlug(slug);

  if (!result.success || !result.data) {
    redirect("/");
  }

  const book = result.data;

  return (
    <div className="book-page-container">
      <Link href="/" className="back-btn-floating">
        <ArrowLeft className="size-6 text-[#212a3b]" />
      </Link>

      <VapiControls book={book} />
    </div>
  );
}