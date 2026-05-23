/// <reference types="vite/client" />
declare const GITHUB_RUNTIME_PERMANENT_NAME: string
declare const BASE_KV_SERVICE_URL: string

// WebMCP proposed web standard – https://github.com/explainers-by-googlers/web-mcp
// Extends HTML element attributes so <form webmcp …> is valid without `any` casts.
declare namespace React {
  interface HTMLAttributes<T> {
    /** WebMCP declarative attribute – marks this element as an agent-accessible tool. */
    webmcp?: string | boolean;
    /** Human-readable name of the WebMCP tool exposed by this element. */
    'data-webmcp-name'?: string;
    /** Human-readable description of the WebMCP tool exposed by this element. */
    'data-webmcp-description'?: string;
  }
}
