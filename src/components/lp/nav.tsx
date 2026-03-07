export const Nav = () => {
    return (
        <nav className="fixed top-0 w-full z-50 bg-white/50 dark:bg-black/50 backdrop-blur-md border-b border-white/10">
            <div className="lp-container flex justify-between items-center h-20">
                <div className="text-2xl font-bold tracking-tight">Foovii</div>
                <div className="hidden md:flex items-center gap-8 text-sm font-medium">
                    <a href="#benefits" className="hover:opacity-60 transition-opacity">Benefits</a>
                    <a href="#how-it-works" className="hover:opacity-60 transition-opacity">How it Works</a>
                    <a href="#pricing" className="hover:opacity-60 transition-opacity">Pricing</a>
                    <a href="#faq" className="hover:opacity-60 transition-opacity">FAQ</a>
                    <button className="btn-primary py-2 px-6 text-sm">Get Started</button>
                </div>
            </div>
        </nav>
    );
};
