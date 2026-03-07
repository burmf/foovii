"use client";
import { motion } from "framer-motion";
import { Users, Ear, BarChart3, Clock, Zap } from "lucide-react";

const benefits = [
    {
        title: "No more extra hires",
        description: "Your customers order from their phone. Your team handles more tables without the extra hire.",
        icon: <Users className="w-6 h-6" />,
    },
    {
        title: "Cut out the confusion",
        description: "No more \"sorry, can you say that again?\" Orders go straight from the table to your kitchen screen.",
        icon: <Ear className="w-6 h-6" />,
    },
    {
        title: "Sell with 3D",
        description: "Your best sellers and set menus, in 3D. We make it easy for customers to see what they want and order.",
        icon: <BarChart3 className="w-6 h-6" />,
    },
    {
        title: "Update in 10 seconds",
        description: "Sold out? Price change? Update your menu in 10 seconds. No reprinting. No crossing out with a pen.",
        icon: <Clock className="w-6 h-6" />,
    },
    {
        title: "Start in minutes",
        description: "Print a QR code. Stick it on the table. That's it. Your customers are already ordering.",
        icon: <Zap className="w-6 h-6" />,
    },
];

export const Benefits = () => {
    return (
        <section id="benefits" className="py-24 bg-neutral-50 dark:bg-neutral-900/50">
            <div className="lp-container">
                <div className="text-center mb-16">
                    <h2 className="text-4xl md:text-5xl font-bold mb-4 tracking-tight">Built for Australian Venues.</h2>
                    <p className="text-xl text-muted-foreground">Everything you need to run a more profitable floor.</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {benefits.map((benefit, idx) => (
                        <motion.div
                            key={idx}
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: idx * 0.1 }}
                            className="glass-card p-8 rounded-3xl"
                        >
                            <div className="w-12 h-12 bg-black dark:bg-white text-white dark:text-black rounded-2xl flex items-center justify-center mb-6">
                                {benefit.icon}
                            </div>
                            <h3 className="text-xl font-bold mb-3">{benefit.title}</h3>
                            <p className="text-muted-foreground leading-relaxed">{benefit.description}</p>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    );
};
