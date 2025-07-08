import { signIn, signOut, useSession } from "next-auth/react";

export default function Appbar() {
    const session = useSession();

    return (
        <nav className="w-full bg-transparent shadow-md px-6 py-4">
            <div className="max-w-7xl mx-auto flex items-center justify-between">
                <div className="text-2xl font-bold text-black-700 hover:text-black-700 transition-colors">
                    Muzer
                </div>
                
                <div className="flex items-center gap-6">
                    {session.data?.user?.name && (
                        <span className="text-gray-700">
                            Welcome, {session.data.user.name}
                        </span>
                    )}

                    {session.status === "authenticated" ? (
                        <button
                            onClick={() => signOut()}
                            className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
                        >
                            Sign Out
                        </button>
                    ) : (
                        <button
                            onClick={() => signIn()}
                            className="px-4 py-2 bg-indigo-500 text-white rounded-lg hover:bg-indigo-600 transition-colors"
                        >
                            Sign In
                        </button>
                    )}
                </div>
            </div>
        </nav>
    );
}