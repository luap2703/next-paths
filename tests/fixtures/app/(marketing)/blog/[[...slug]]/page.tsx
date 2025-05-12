import React from "react";

export default function BlogPost({ params }: { params: { slug?: string[] } }) {
  return <div>Blog Post: {params.slug?.join("/") || "index"}</div>;
}
