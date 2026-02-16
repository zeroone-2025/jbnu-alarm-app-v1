import { ReactNode } from 'react';

interface AuthPageShellProps {
  children: ReactNode;
  center?: boolean;
}

export default function AuthPageShell({ children, center }: AuthPageShellProps) {
  return (
    <div className="min-h-dvh bg-gray-50">
      <div className="mx-auto flex min-h-dvh w-full max-w-md md:max-w-[calc(280px+56rem)] md:shadow-xl">
        <div
          className={`flex min-h-dvh w-full flex-1 flex-col border-x border-gray-100 bg-white shadow-xl md:shadow-none ${
            center ? 'items-center justify-center' : ''
          }`}
        >
          {children}
        </div>
      </div>
    </div>
  );
}
