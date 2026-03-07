export const Footer = () => {
    return (
        <footer className="py-12 border-t border-neutral-100 dark:border-neutral-900">
            <div className="lp-container">
                <div className="flex flex-col md:flex-row justify-between items-center gap-8 text-sm text-muted-foreground">
                    <div>
                        © 2026 Foovii · ABN 70 133 277 889
                    </div>
                    <div className="flex items-center gap-6">
                        <a href="/privacy" className="hover:text-black dark:hover:text-white transition-colors">Privacy Policy</a>
                        <a href="/terms" className="hover:text-black dark:hover:text-white transition-colors">Terms of Service</a>
                        <a href="mailto:hello@foovii.menu" className="hover:text-black dark:hover:text-white transition-colors">Contact</a>
                    </div>
                </div>
            </div>
        </footer>
    );
};
