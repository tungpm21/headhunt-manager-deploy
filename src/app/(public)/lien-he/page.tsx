"use client";

import { useState } from "react";
import Link from "next/link";
import { Mail, Phone, User, MessageSquare, Send, CheckCircle } from "lucide-react";

// export const metadata: Metadata = {
//   title: "Liên hệ",
//   description: "Liên hệ FDIWork để được tư vấn dịch vụ tuyển dụng cho doanh nghiệp FDI.",
// };

export default function ContactPage() {
    const [submitted, setSubmitted] = useState(false);
    const [loading, setLoading] = useState(false);

    async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();
        setLoading(true);
        // Simulate form submission
        await new Promise((resolve) => setTimeout(resolve, 1000));
        setLoading(false);
        setSubmitted(true);
    }

    if (submitted) {
        return (
            <div className="min-h-screen bg-gray-50/50 flex items-center justify-center px-4">
                <div className="text-center max-w-md">
                    <div className="inline-flex items-center justify-center h-16 w-16 rounded-full bg-green-100 mb-4">
                        <CheckCircle className="h-8 w-8 text-green-600" />
                    </div>
                    <h2
                        className="text-2xl font-bold text-[var(--color-fdi-text)] mb-2"
                        style={{ fontFamily: "var(--font-heading)" }}
                    >
                        Gửi thành công!
                    </h2>
                    <p className="text-[var(--color-fdi-text-secondary)] mb-6">
                        Cảm ơn bạn đã liên hệ. Đội ngũ FDIWork sẽ phản hồi trong vòng 24 giờ.
                    </p>
                    <Link
                        href="/"
                        className="inline-flex items-center gap-2 px-6 py-2.5 rounded-full bg-[var(--color-fdi-primary)] text-white text-sm font-semibold hover:bg-[var(--color-fdi-primary-hover)] transition-all cursor-pointer"
                    >
                        Về trang chủ
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50/50">
            {/* Header */}
            <div className="bg-[var(--color-fdi-primary)]">
                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12">
                    <h1
                        className="text-3xl font-bold text-white"
                        style={{ fontFamily: "var(--font-heading)" }}
                    >
                        Liên hệ với chúng tôi
                    </h1>
                    <p className="text-blue-100 mt-2">
                        Để lại thông tin, đội ngũ FDIWork sẽ tư vấn ngay cho bạn
                    </p>
                </div>
            </div>

            <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 py-10">
                <div className="bg-white rounded-xl border border-gray-100 p-6 sm:p-10">
                    <form onSubmit={handleSubmit} className="space-y-5">
                        {/* Name */}
                        <div>
                            <label className="flex items-center gap-1.5 text-sm font-medium text-[var(--color-fdi-text)] mb-1.5">
                                <User className="h-4 w-4 text-[var(--color-fdi-primary)]" />
                                Họ và tên <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="text"
                                name="name"
                                required
                                placeholder="Nguyễn Văn A"
                                className="w-full px-4 py-2.5 rounded-lg border border-gray-200 text-sm text-[var(--color-fdi-text)] placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[var(--color-fdi-primary)]/30 focus:border-[var(--color-fdi-primary)] transition-all"
                            />
                        </div>

                        {/* Phone */}
                        <div>
                            <label className="flex items-center gap-1.5 text-sm font-medium text-[var(--color-fdi-text)] mb-1.5">
                                <Phone className="h-4 w-4 text-[var(--color-fdi-primary)]" />
                                Số điện thoại <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="tel"
                                name="phone"
                                required
                                placeholder="0901 234 567"
                                className="w-full px-4 py-2.5 rounded-lg border border-gray-200 text-sm text-[var(--color-fdi-text)] placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[var(--color-fdi-primary)]/30 focus:border-[var(--color-fdi-primary)] transition-all"
                            />
                        </div>

                        {/* Email */}
                        <div>
                            <label className="flex items-center gap-1.5 text-sm font-medium text-[var(--color-fdi-text)] mb-1.5">
                                <Mail className="h-4 w-4 text-[var(--color-fdi-primary)]" />
                                Email <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="email"
                                name="email"
                                required
                                placeholder="email@example.com"
                                className="w-full px-4 py-2.5 rounded-lg border border-gray-200 text-sm text-[var(--color-fdi-text)] placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[var(--color-fdi-primary)]/30 focus:border-[var(--color-fdi-primary)] transition-all"
                            />
                        </div>

                        {/* Message */}
                        <div>
                            <label className="flex items-center gap-1.5 text-sm font-medium text-[var(--color-fdi-text)] mb-1.5">
                                <MessageSquare className="h-4 w-4 text-[var(--color-fdi-primary)]" />
                                Nội dung
                            </label>
                            <textarea
                                name="message"
                                rows={4}
                                placeholder="Mô tả nhu cầu của bạn..."
                                className="w-full px-4 py-2.5 rounded-lg border border-gray-200 text-sm text-[var(--color-fdi-text)] placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[var(--color-fdi-primary)]/30 focus:border-[var(--color-fdi-primary)] transition-all resize-none"
                            />
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full flex items-center justify-center gap-2 px-6 py-3 rounded-full bg-[var(--color-fdi-primary)] text-white text-sm font-semibold hover:bg-[var(--color-fdi-primary-hover)] transition-all disabled:opacity-60 cursor-pointer"
                        >
                            {loading ? (
                                <span>Đang gửi...</span>
                            ) : (
                                <>
                                    <Send className="h-4 w-4" />
                                    Gửi thông tin
                                </>
                            )}
                        </button>
                    </form>

                    <div className="mt-8 pt-6 border-t border-gray-100 grid grid-cols-1 sm:grid-cols-3 gap-4 text-center">
                        <div>
                            <Mail className="h-5 w-5 text-[var(--color-fdi-primary)] mx-auto mb-1" />
                            <p className="text-xs text-[var(--color-fdi-text-secondary)]">Email</p>
                            <p className="text-sm font-medium text-[var(--color-fdi-text)]">
                                contact@fdiwork.com
                            </p>
                        </div>
                        <div>
                            <Phone className="h-5 w-5 text-[var(--color-fdi-primary)] mx-auto mb-1" />
                            <p className="text-xs text-[var(--color-fdi-text-secondary)]">Điện thoại</p>
                            <p className="text-sm font-medium text-[var(--color-fdi-text)]">
                                0901 234 567
                            </p>
                        </div>
                        <div>
                            <MessageSquare className="h-5 w-5 text-[var(--color-fdi-primary)] mx-auto mb-1" />
                            <p className="text-xs text-[var(--color-fdi-text-secondary)]">Zalo</p>
                            <p className="text-sm font-medium text-[var(--color-fdi-text)]">
                                FDIWork Official
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
