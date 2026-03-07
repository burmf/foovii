"use client";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown } from "lucide-react";

const faqs = [
    {
        q: "How much does it cost?",
        a: "We offer flexible plans starting at A$0/mo. You only pay for what you use. Check our pricing section for details.",
    },
    {
        q: "Do my customers need to download an app?",
        a: "No. They scan the QR code and the menu opens in their mobile browser instantly. Nothing to install.",
    },
    {
        q: "What if a dish sells out during service?",
        a: "You can mark any dish as sold out in seconds through your dashboard. It disappears from the customer menu immediately.",
    },
    {
        q: "Do I need to buy any extra equipment?",
        a: "No. Foovii works on any phone or tablet you already own. We recommend one tablet for the kitchen and one for the floor staff.",
    },
    {
        q: "Can I update prices myself?",
        a: "Yes. You have full control. Change prices, descriptions, or photos anytime and they go live instantly.",
    },
    {
        q: "What about the 3D menu?",
        a: "We create 3D models of your best dishes. It's designed to increase average order value as customers can see exactly what they're getting.",
    },
    {
        q: "What happens if the internet goes down?",
        a: "Foovii requires an internet connection. We recommend having a small printed backup menu for emergencies.",
    },
    {
        q: "Is it available in other languages?",
        a: "Yes. Foovii supports multiple languages, making it easy for non-English speaking customers to order with confidence.",
    },
    {
        q: "How do customers pay?",
        a: "They can pay via Card, Apple Pay, or Google Pay directly on their phone, or choose to pay at the counter.",
    },
    {
        q: "Can I use it for takeaway orders?",
        a: "Absolutely. Customers can browse and order for pickup. The 3D previews help them decide even when they aren't at the venue.",
    },
    {
        q: "Is there a long-term contract?",
        a: "No. All our plans are month-to-month. You can cancel anytime without any hidden fees.",
    },
];

export const FAQ = () => {
    const [openIndex, setOpenIndex] = useState<number | null>(null);

    return (
        <section id="faq" className="py-24">
            <div className="lp-container max-w-3xl">
                <div className="text-center mb-16">
                    <h2 className="text-4xl font-bold tracking-tight mb-4">Frequently Asked Questions</h2>
                    <p className="text-xl text-muted-foreground">Everything you need to know about Foovii.</p>
                </div>

                <div className="space-y-4">
                    {faqs.map((faq, idx) => (
                        <div key={idx} className="border-b border-neutral-200 dark:border-neutral-800 pb-4">
                            <button
                                onClick={() => setOpenIndex(openIndex === idx ? null : idx)}
                                className="w-full flex justify-between items-center py-4 text-left hover:opacity-70 transition-opacity"
                            >
                                <span className="text-lg font-semibold">{faq.q}</span>
                                <ChevronDown className={`w-5 h-5 transition-transform ${openIndex === idx ? 'rotate-180' : ''}`} />
                            </button>
                            <AnimatePresence>
                                {openIndex === idx && (
                                    <motion.div
                                        initial={{ height: 0, opacity: 0 }}
                                        animate={{ height: "auto", opacity: 1 }}
                                        exit={{ height: 0, opacity: 0 }}
                                        transition={{ duration: 0.3, ease: "easeInOut" }}
                                        className="overflow-hidden"
                                    >
                                        <p className="pb-4 text-muted-foreground leading-relaxed">
                                            {faq.a}
                                        </p>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
};
