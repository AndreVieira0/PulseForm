import { signOut } from "@/backend/auth";

interface HeaderProps {
  userName?: string | null;
  userEmail?: string | null;
}

export function Header({ userName, userEmail }: HeaderProps) {
  return (
    <header className="bg-white border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
        <h1 className="text-xl font-bold text-blue-600">PulseForm</h1>
        <div className="flex items-center space-x-4">
          <span className="text-sm text-gray-700">
            Olá, <strong>{userName || userEmail}</strong>
          </span>

          <form
            action={async () => {
              "use server";
              await signOut({ redirectTo: "/login" });
            }}
          >
            <button
              type="submit"
              className="text-sm text-red-600 hover:text-red-800 font-medium transition-colors"
            >
              Sair
            </button>
          </form>
        </div>
      </div>
    </header>
  );
}
