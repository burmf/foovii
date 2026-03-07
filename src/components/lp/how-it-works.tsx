"use client";
import { motion } from "framer-motion";

export const HowItWorks = () => {
    return (
        <section id="how-it-works" className="py-24">
            <div className="lp-container">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-20">
                    {/* Customer Side */}
                    <div>
                        <h2 className="text-3xl font-bold mb-12 flex items-center gap-4">
                            <span className="w-10 h-10 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-sm">FOR</span>
                            Customers
                        </h2>
                        <div className="space-y-12 relative">
                            {[
                                { step: "01", title: "Scan", desc: "Customer scans the QR code on the table." },
                                { step: "02", title: "Browse", desc: "They browse your menu, with signature dishes in stunning 3D." },
                                { step: "03", title: "Order & Pay", desc: "They order and pay right from their seat. Simple." },
                            ].map((item, idx) => (
                                <div key={idx} className="flex gap-6">
                                    <span className="text-4xl font-bold text-neutral-200 mt-1">{item.step}</span>
                                    <div>
                                        <h3 className="text-xl font-bold mb-2">{item.title}</h3>
                                        <p className="text-muted-foreground">{item.desc}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Venue Side */}
                    <div>
                        <h2 className="text-3xl font-bold mb-12 flex items-center gap-4">
                            <span className="w-10 h-10 rounded-full bg-purple-100 text-purple-600 flex items-center justify-center text-sm">FOR</span>
                            Venues
                        </h2>
                        <div className="space-y-12">
                            {[
                                { step: "01", title: "Send us your menu", desc: "Share your menu and dish photos. Your digital menu goes live within days." },
                                { step: "02", title: "Go live", desc: "Print QR codes, place one on each table. Customers start ordering right away." },
                                { step: "03", title: "3D upgrade", desc: "Together, we pick your best dishes and turn them into 3D models that sell." },
                            ].map((item, idx) => (
                                <div key={idx} className="flex gap-6">
                                    <span className="text-4xl font-bold text-neutral-200 mt-1">{item.step}</span>
                                    <div>
                                        <h3 className="text-xl font-bold mb-2">{item.title}</h3>
                                        <p className="text-muted-foreground">{item.desc}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
};
