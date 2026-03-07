import Link from "next/link";

export function Pricing() {
    return (
        <section id="pricing" className="py-24 md:py-32">
            <div className="lp-container">
                <div className="text-center space-y-4 mb-16">
                    <h2 className="text-3xl md:text-5xl font-bold tracking-tight">Transparent <span className="text-gradient">Pricing.</span></h2>
                    <p className="text-muted-foreground text-lg">Choose the plan that fits your venue's size and needs.</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
                    {/* Menu Plan */}
                    <div className="glass-card p-8 md:p-12 rounded-[2.5rem] flex flex-col space-y-8">
                        <div className="space-y-2">
                            <h3 className="text-2xl font-bold">Menu Plan</h3>
                            <p className="text-muted-foreground">Digitalize your menu with AR & 3D visualization.</p>
                        </div>
                        <div className="text-4xl font-bold">
                            AU$80 - 120 <span className="text-lg font-normal text-muted-foreground">/ month</span>
                        </div>
                        <ul className="space-y-4 flex-1">
                            {["QR Digital Menu", "3D / AR Viewer", "Order Management Dashboard", "Staff Sound Notifications"].map((item, i) => (
                                <li key={i} className="flex items-center gap-3">
                                    <div className="w-5 h-5 rounded-full bg-black/5 dark:bg-white/5 flex items-center justify-center text-xs">✓</div>
                                    <span className="text-sm">{item}</span>
                                </li>
                            ))}
                        </ul>
                        <Link href="/contact" className="btn-secondary text-center py-3">Get Started</Link>
                    </div>

                    {/* Menu + Pay Plan */}
                    <div className="glass-card p-8 md:p-12 rounded-[2.5rem] border-primary/20 dark:border-white/20 bg-neutral-900 text-white flex flex-col space-y-8 relative overflow-hidden shadow-2xl">
                        <div className="absolute top-6 right-6 px-3 py-1 bg-white/10 rounded-full text-[10px] font-bold tracking-widest uppercase">Popular</div>
                        <div className="space-y-2">
                            <h3 className="text-2xl font-bold">Menu + Pay</h3>
                            <p className="text-white/60">Full suite including seamless mobile payments.</p>
                        </div>
                        <div className="space-y-1">
                            <div className="text-4xl font-bold">
                                AU$80 - 120 <span className="text-lg font-normal text-white/50">/ month</span>
                            </div>
                            <p className="text-xs text-white/50">+ 0.5% ~ 1% application fee</p>
                        </div>
                        <ul className="space-y-4 flex-1">
                            {[
                                "Everything in Menu Plan",
                                "Mobile Card Payments",
                                "Apple Pay & Google Pay",
                                "Stripe Connect Integration",
                                "Zero transaction risk for venues"
                            ].map((item, i) => (
                                <li key={i} className="flex items-center gap-3">
                                    <div className="w-5 h-5 rounded-full bg-white/10 flex items-center justify-center text-xs">✓</div>
                                    <span className="text-sm">{item}</span>
                                </li>
                            ))}
                        </ul>
                        <Link href="/contact" className="px-8 py-4 bg-white text-black rounded-full font-semibold transition-all hover:scale-105 active:scale-95 text-center">Get Started</Link>
                    </div>
                </div>
            </div>
        </section>
    );
}
