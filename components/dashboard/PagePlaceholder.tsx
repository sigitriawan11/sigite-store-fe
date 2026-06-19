"use client";

interface PagePlaceholderProps {
  title: string;
  description?: string;
}

const PagePlaceholder = ({ title, description }: PagePlaceholderProps) => {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
      <div className="w-20 h-20 rounded-2xl bg-(--color-1)/10 flex items-center justify-center mb-6">
        <svg
          className="w-10 h-10 text-(--color-1)"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={1.5}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M20.25 7.5l-.625 10.632a2.25 2.25 0 01-2.247 2.118H6.622a2.25 2.25 0 01-2.247-2.118L3.75 7.5m6 4.125l2.25 2.25m0 0l2.25 2.25M12 13.875l2.25-2.25M12 13.875l-2.25 2.25M3.375 7.5h17.25c.621 0 1.125-.504 1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125H3.375c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125z"
          />
        </svg>
      </div>
      <h2 className="text-2xl font-bold text-white mb-2">{title}</h2>
      {description && (
        <p className="text-gray-500 max-w-md">{description}</p>
      )}
      <div className="mt-8 flex items-center gap-2 text-sm text-gray-600">
        <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
        <span>Page ready for implementation</span>
      </div>
    </div>
  );
};

export default PagePlaceholder;