import React from "react";

function Skeleton({ className = "" }) {
  return <div className={`animate-pulse rounded bg-slate-500/20 ${className}`} />;
}

function Shell({ children }) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-(--auth-bg) p-4">
      <div className="w-full max-w-[420px] rounded-2xl border border-(--auth-border) bg-(--auth-surface) p-8">
        {children}
      </div>
    </div>
  );
}

export function LoginSkeleton() {
  return (
    <Shell>
      <div className="mb-6 flex justify-center">
        <Skeleton className="h-12 w-12 rounded-full" />
      </div>

      <Skeleton className="mx-auto mb-2 h-8 w-3/5" />
      <Skeleton className="mx-auto mb-8 h-4 w-4/5" />

      <div className="mb-6 flex gap-4">
        <Skeleton className="h-11 flex-1" />
        <Skeleton className="h-11 flex-1" />
      </div>

      <div className="mb-6 flex items-center gap-4">
        <Skeleton className="h-px flex-1" />
        <Skeleton className="h-3 w-20" />
        <Skeleton className="h-px flex-1" />
      </div>

      <div className="mb-6 space-y-4">
        <Skeleton className="h-3.5 w-16" />
        <Skeleton className="h-11 w-full" />
        <div className="mt-2 flex items-center justify-between">
          <Skeleton className="h-3.5 w-16" />
          <Skeleton className="h-3.5 w-24" />
        </div>
        <Skeleton className="h-11 w-full" />
      </div>

      <Skeleton className="mb-6 h-12 w-full" />
      <Skeleton className="mx-auto h-4 w-2/3" />
    </Shell>
  );
}

export function RegisterSkeleton() {
  return (
    <Shell>
      <div className="mb-6 flex justify-center">
        <Skeleton className="h-12 w-12 rounded-full" />
      </div>

      <Skeleton className="mx-auto mb-2 h-8 w-3/5" />
      <Skeleton className="mx-auto mb-8 h-4 w-4/5" />

      <div className="mb-6 flex gap-4">
        <Skeleton className="h-11 flex-1" />
        <Skeleton className="h-11 flex-1" />
      </div>

      <div className="mb-6 flex items-center gap-4">
        <Skeleton className="h-px flex-1" />
        <Skeleton className="h-3 w-20" />
        <Skeleton className="h-px flex-1" />
      </div>

      <div className="mb-6 space-y-4">
        <Skeleton className="h-3.5 w-16" />
        <Skeleton className="h-11 w-full" />
        <Skeleton className="h-3.5 w-16" />
        <Skeleton className="h-11 w-full" />
        <Skeleton className="h-3.5 w-16" />
        <Skeleton className="h-11 w-full" />
        <div className="mt-2 flex gap-2">
          <Skeleton className="h-1 flex-1" />
          <Skeleton className="h-1 flex-1" />
          <Skeleton className="h-1 flex-1" />
          <Skeleton className="h-1 flex-1" />
        </div>
      </div>

      <Skeleton className="mb-6 h-12 w-full" />
      <Skeleton className="mx-auto h-4 w-2/3" />
    </Shell>
  );
}

export function SimpleFormSkeleton({ fieldCount = 1, title = true }) {
  return (
    <Shell>
      <div className="mb-6 flex justify-center">
        <Skeleton className="h-12 w-12 rounded-full" />
      </div>

      {title && (
        <>
          <Skeleton className="mx-auto mb-2 h-8 w-3/5" />
          <Skeleton className="mx-auto mb-8 h-4 w-4/5" />
        </>
      )}

      <div className="mb-6 space-y-4">
        {Array.from({ length: fieldCount }).map((_, i) => (
          <React.Fragment key={i}>
            <Skeleton className="h-3.5 w-16" />
            <Skeleton className="h-11 w-full" />
          </React.Fragment>
        ))}
      </div>

      <Skeleton className="mb-6 h-12 w-full" />
      <Skeleton className="mx-auto h-4 w-2/3" />
    </Shell>
  );
}

export default { LoginSkeleton, RegisterSkeleton, SimpleFormSkeleton };


