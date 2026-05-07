"use client";

import { useState, useRef } from "react";
import { motion } from "framer-motion";
import {
  Building2,
  UploadCloud,
  ArrowRight,
  ChevronDown,
  Shield,
  CheckCircle,
  Loader2,
} from "lucide-react";

const orgTypes = [
  { value: "company", label: "Company" },
  { value: "startup", label: "Startup" },
  { value: "enterprise", label: "Enterprise" },
  { value: "nonprofit", label: "Non‑profit" },
  { value: "agency", label: "Agency" },
  { value: "freelancer_collective", label: "Freelancer Collective" },
];

const industries = [
  "Technology",
  "Finance",
  "Healthcare",
  "E‑Commerce",
  "Education",
  "Manufacturing",
  "AI & Machine Learning",
  "Logistics",
];

export default function CreateOrganizationPage() {
  const [logoPreview, setLogoPreview] = useState(null);
  const [bannerPreview, setBannerPreview] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [form, setForm] = useState({
    name: "",
    slug: "",
    type: "",
    industry: "",
    description: "",
  });

  const logoRef = useRef(null);
  const bannerRef = useRef(null);

  const generateSlug = (name) => {
    const slug = name
      .toLowerCase()
      .replace(/\s+/g, "-")
      .replace(/[^a-z0-9-]/g, "");
    setForm((prev) => ({ ...prev, name, slug }));
  };

  const handleFileChange = (e, setPreview) => {
    const file = e.target.files[0];
    if (file) {
      setPreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1500));
    console.log("Submitting:", { ...form, logoPreview, bannerPreview });
    setIsSubmitting(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-indigo-50 flex items-center justify-center p-6 relative overflow-hidden">
      {/* Animated background blobs */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-indigo-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-pulse" />
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-purple-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-pulse" />

      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        className="w-full max-w-4xl bg-white/70 backdrop-blur-2xl border border-white/50 shadow-2xl rounded-3xl p-8 md:p-12 relative z-10"
      >
        {/* Header */}
        <div className="flex items-center gap-3 mb-8">
          <div className="p-2 bg-indigo-100 rounded-xl">
            <Building2 className="w-6 h-6 text-indigo-600" />
          </div>
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-slate-900 to-slate-700 bg-clip-text text-transparent">
              Create Organization
            </h1>
            <p className="text-slate-500 text-sm">
              Establish your trust profile on the network.
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="grid md:grid-cols-2 gap-8">
            {/* Left: Media uploads */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
              className="space-y-6"
            >
              {/* Banner */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Banner Image
                </label>
                <input
                  type="file"
                  ref={bannerRef}
                  className="hidden"
                  accept="image/*"
                  onChange={(e) => handleFileChange(e, setBannerPreview)}
                />
                <motion.div
                  whileHover={{ scale: 1.02 }}
                  className="relative h-40 rounded-2xl border-2 border-dashed border-slate-300 bg-slate-50/50 overflow-hidden flex items-center justify-center cursor-pointer group transition-colors hover:border-indigo-400"
                  onClick={() => bannerRef.current.click()}
                >
                  {bannerPreview ? (
                    <img
                      src={bannerPreview}
                      alt="Banner"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="text-center text-slate-400 group-hover:text-indigo-500 transition-colors">
                      <UploadCloud className="w-8 h-8 mx-auto mb-2" />
                      <p className="text-sm font-medium">Drop your banner here</p>
                      <p className="text-xs">1600x400 recommended</p>
                    </div>
                  )}
                </motion.div>
              </div>

              {/* Logo */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Logo
                </label>
                <div className="flex items-end gap-4">
                  <input
                    type="file"
                    ref={logoRef}
                    className="hidden"
                    accept="image/*"
                    onChange={(e) => handleFileChange(e, setLogoPreview)}
                  />
                  <motion.div
                    whileHover={{ scale: 1.1, rotate: 5 }}
                    className="w-24 h-24 rounded-2xl border-2 border-dashed border-slate-300 bg-slate-50/50 overflow-hidden flex items-center justify-center cursor-pointer group hover:border-indigo-400 transition-all"
                    onClick={() => logoRef.current.click()}
                  >
                    {logoPreview ? (
                      <img
                        src={logoPreview}
                        alt="Logo"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <UploadCloud className="w-6 h-6 text-slate-400 group-hover:text-indigo-500 transition-colors" />
                    )}
                  </motion.div>
                  <div className="text-xs text-slate-500 pb-2">
                    <p>SVG, PNG, or JPG</p>
                    <p>Max 2MB</p>
                  </div>
                </div>
              </div>

              {/* Trust Info Box */}
              <div className="p-4 bg-indigo-50/50 border border-indigo-100 rounded-xl flex items-start gap-3">
                <Shield className="w-5 h-5 text-indigo-500 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-sm font-medium text-indigo-900">Trust Starts Here</p>
                  <p className="text-xs text-indigo-700/70 mt-1">Completing your profile accurately boosts your initial trust score and verification speed.</p>
                </div>
              </div>
            </motion.div>

            {/* Right: Form fields */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
              className="space-y-5"
            >
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">
                  Organization Name *
                </label>
                <input
                  type="text"
                  value={form.name}
                  onChange={(e) => generateSlug(e.target.value)}
                  className="w-full px-4 py-3 bg-white/50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all text-slate-800 placeholder:text-slate-400"
                  placeholder="Acme Corporation"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">
                  URL Slug
                </label>
                <div className="flex items-center w-full px-4 py-3 bg-slate-100/50 border border-slate-200 rounded-xl text-slate-500">
                  <span className="text-slate-400 mr-1 text-sm">orgs/</span>
                  <span className="text-slate-800 font-medium">
                    {form.slug || "your-org"}
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="relative">
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">
                    Type
                  </label>
                  <select
                    value={form.type}
                    onChange={(e) => setForm({ ...form, type: e.target.value })}
                    className="w-full px-4 py-3 bg-white/50 border border-slate-200 rounded-xl appearance-none focus:ring-2 focus:ring-indigo-500 outline-none transition-all text-slate-800"
                  >
                    <option value="">Select…</option>
                    {orgTypes.map((t) => (
                      <option key={t.value} value={t.value}>
                        {t.label}
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="absolute right-3 top-[38px] w-5 h-5 text-slate-400 pointer-events-none" />
                </div>

                <div className="relative">
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">
                    Industry
                  </label>
                  <select
                    value={form.industry}
                    onChange={(e) =>
                      setForm({ ...form, industry: e.target.value })
                    }
                    className="w-full px-4 py-3 bg-white/50 border border-slate-200 rounded-xl appearance-none focus:ring-2 focus:ring-indigo-500 outline-none transition-all text-slate-800"
                  >
                    <option value="">Select…</option>
                    {industries.map((i) => (
                      <option key={i} value={i}>
                        {i}
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="absolute right-3 top-[38px] w-5 h-5 text-slate-400 pointer-events-none" />
                </div>
              </div>

              <div>
                <div className="flex justify-between items-center mb-1.5">
                  <label className="block text-sm font-medium text-slate-700">
                    Description
                  </label>
                  <span className="text-xs text-slate-400">{form.description.length}/500</span>
                </div>
                <textarea
                  rows={3}
                  maxLength={500}
                  value={form.description}
                  onChange={(e) =>
                    setForm({ ...form, description: e.target.value })
                  }
                  className="w-full px-4 py-3 bg-white/50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all resize-none text-slate-800 placeholder:text-slate-400"
                  placeholder="Tell the world what your organization does…"
                />
              </div>
            </motion.div>
          </div>

          {/* Submit button */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="mt-10 flex justify-end"
          >
            <motion.button
              type="submit"
              disabled={isSubmitting}
              whileHover={{ scale: 1.03, boxShadow: "0 10px 30px -10px rgba(79, 70, 229, 0.5)" }}
              whileTap={{ scale: 0.98 }}
              className="flex items-center gap-2 px-8 py-3.5 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-semibold rounded-xl shadow-lg transition-all disabled:opacity-80"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" /> Creating...
                </>
              ) : (
                <>
                  Create Organization
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </motion.button>
          </motion.div>
        </form>
      </motion.div>
    </div>
  );
}