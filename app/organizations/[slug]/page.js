"use client";

import { useState } from "react";
import { useParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import {
  ShieldCheck,
  Star,
  Users,
  Package,
  Link2,
  MapPin,
  Globe,
  Hexagon,
  ArrowUpRight,
} from "lucide-react";
import {
  fetchOrganizationBySlug,
  fetchOrganizationTrustVectors,
  fetchOrganizationRelationships,
  fetchOrganizationMembers,
  fetchOrganizationProducts,
} from "../components/data";
import { ErrorFallback } from "../components/ErrorFallback";
import { LoadingSkeleton } from "../components/LoadingSkeleton";

const tabs = ["Overview", "Products", "Team", "Connections"];

export default function PublicProfilePage() {
  const { slug } = useParams();

  // Fetch organization details
  const {
    data: orgData,
    isLoading: orgLoading,
    error: orgError,
    refetch: refetchOrg,
  } = useQuery({
    queryKey: ["organization", slug],
    queryFn: () => fetchOrganizationBySlug(slug),
    enabled: !!slug,
  });

  const organization = orgData?.data || null;

  // Fetch trust vectors
  const { data: trustData, isLoading: trustLoading } = useQuery({
    queryKey: ["trustVectors", organization?.id],
    queryFn: () => fetchOrganizationTrustVectors(organization.id),
    enabled: !!organization?.id,
  });

  // Fetch partners (relationships where relationship_type = 'partner' and is_public = true)
  const { data: partnersData, isLoading: partnersLoading } = useQuery({
    queryKey: ["partners", organization?.id],
    queryFn: () => fetchOrganizationRelationships(organization.id, "partner"),
    enabled: !!organization?.id,
  });

  // Fetch team members (organization_members with user profiles)
  const { data: teamData, isLoading: teamLoading } = useQuery({
    queryKey: ["team", organization?.id],
    queryFn: () => fetchOrganizationMembers(organization.id),
    enabled: !!organization?.id,
  });

  // Fetch products (marketplace_products)
  const { data: productsData, isLoading: productsLoading } = useQuery({
    queryKey: ["products", organization?.id],
    queryFn: () => fetchOrganizationProducts(organization.id),
    enabled: !!organization?.id,
  });

  const [activeTab, setActiveTab] = useState("Overview");

  if (orgLoading) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-[#050505] py-8">
        <div className="max-w-6xl mx-auto px-6">
          <LoadingSkeleton count={1} type="org" />
        </div>
      </div>
    );
  }

  if (orgError || !organization) {
    return (
      <ErrorFallback
        error={orgError || new Error("Organization not found")}
        resetErrorBoundary={() => refetchOrg()}
      />
    );
  }

  const trustDimensions = trustData?.data || {};
  const partners = partnersData?.data || [];
  const team = teamData?.data || [];
  const products = productsData?.data || [];

  const tierGradient =
    organization.trust_tier === "platinum"
      ? "from-gray-200 via-gray-400 to-gray-100"
      : organization.trust_tier === "gold"
      ? "from-amber-200 to-amber-500"
      : organization.trust_tier === "silver"
      ? "from-slate-300 to-slate-500"
      : "from-orange-200 to-orange-500";

  const displayLocation =
    organization.location ||
    (organization.city && organization.country
      ? `${organization.city}, ${organization.country}`
      : organization.city || organization.country || null);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#050505]">
      {/* Hero Banner */}
      <div className="relative h-64 md:h-80 bg-gradient-to-r from-slate-900 via-indigo-950 to-purple-950 overflow-hidden">
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1451187580459-43490279c0fa?q=80&w=2072&auto=format&fit=crop')] opacity-20 mix-blend-overlay" />
        <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-slate-50 dark:from-[#050505] to-transparent" />

        <motion.div
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.5, type: "spring" }}
          className="absolute top-6 right-6 flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur-md border border-white/20 rounded-full shadow-lg"
        >
          <ShieldCheck className="w-5 h-5 text-emerald-400" />
          <span className="text-white font-medium text-sm">
            {organization.verification_level === "enterprise_verified"
              ? "Enterprise Verified"
              : organization.verification_status === "verified"
              ? "Verified"
              : "Unverified"}
          </span>
        </motion.div>
      </div>

      <div className="max-w-6xl mx-auto px-6 relative -mt-20 z-10">
        {/* Avatar & Core Info */}
        <div className="flex flex-col md:flex-row items-start gap-6">
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="w-32 h-32 rounded-2xl bg-white dark:bg-[#1a1a1a] border-4 border-white dark:border-[#0f0f10] shadow-2xl overflow-hidden flex items-center justify-center bg-gradient-to-br from-indigo-100 to-purple-100 dark:from-indigo-900/30 dark:to-purple-900/30"
          >
            {organization.logo_url ? (
              <img
                src={organization.logo_url}
                alt={organization.name}
                className="w-full h-full object-cover"
              />
            ) : (
              <Hexagon className="w-12 h-12 text-indigo-600 dark:text-indigo-400" />
            )}
          </motion.div>

          <div className="mt-4 md:mt-10 flex-1">
            <div className="flex items-center gap-3 flex-wrap">
              <h1 className="text-3xl md:text-4xl font-bold text-slate-900 dark:text-white">
                {organization.name}
              </h1>
              {organization.trust_tier && organization.trust_tier !== "unrated" && (
                <motion.span
                  animate={{ backgroundPosition: ["0% 50%", "100% 50%", "0% 50%"] }}
                  transition={{ duration: 3, repeat: Infinity }}
                  className={`px-3 py-1 text-xs font-bold uppercase tracking-wider bg-gradient-to-r ${tierGradient} text-amber-900 dark:text-amber-950 rounded-full bg-[length:200%_200%]`}
                >
                  {organization.trust_tier.toUpperCase()} TIER
                </motion.span>
              )}
            </div>
            {organization.tagline && (
              <p className="mt-1 text-slate-600 dark:text-slate-400 text-lg">
                {organization.tagline}
              </p>
            )}

            <div className="flex flex-wrap items-center gap-4 mt-4 text-sm text-slate-500 dark:text-slate-400">
              {displayLocation && (
                <span className="flex items-center gap-1">
                  <MapPin className="w-4 h-4" /> {displayLocation}
                </span>
              )}
              {organization.website && (
                <span className="flex items-center gap-1">
                  <Globe className="w-4 h-4" /> {organization.website}
                </span>
              )}
              <span className="flex items-center gap-1">
                <Star className="w-4 h-4 text-amber-400" />{" "}
                {organization.average_rating || "N/A"} / 5.0
              </span>
            </div>
          </div>
        </div>

        {/* Quick stats cards */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-8"
        >
          {[
            { label: "Team Members", value: organization.member_count || 0, icon: Users },
            { label: "Products", value: products.length, icon: Package },
            { label: "Partners", value: partners.length, icon: Link2 },
            { label: "Trust Score", value: `${organization.trust_score || 0}/100`, icon: ShieldCheck },
          ].map((stat, i) => (
            <motion.div
              key={stat.label}
              whileHover={{ y: -2, boxShadow: "0 8px 30px rgba(0,0,0,0.08)" }}
              className="bg-white dark:bg-[#0f0f10] p-4 rounded-xl border border-slate-100 dark:border-white/[0.04] flex items-center gap-4 transition-all"
            >
              <div className="p-2 bg-indigo-50 dark:bg-indigo-500/10 rounded-lg text-indigo-600 dark:text-indigo-400">
                <stat.icon className="w-5 h-5" />
              </div>
              <div>
                <p className="text-2xl font-bold text-slate-900 dark:text-white">
                  {stat.value}
                </p>
                <p className="text-xs text-slate-500 dark:text-slate-400">{stat.label}</p>
              </div>
            </motion.div>
          ))}
        </motion.div>

        {/* Trust dimensions progress bars */}
        {!trustLoading && Object.keys(trustDimensions).length > 0 && (
          <div className="mt-8 bg-white dark:bg-[#0f0f10] p-6 rounded-2xl border border-slate-100 dark:border-white/[0.04] shadow-sm">
            <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
              <ShieldCheck className="text-indigo-500 w-5 h-5" /> Trust Dimensions
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {Object.entries(trustDimensions).map(([key, val]) => (
                <div key={key}>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="capitalize text-slate-600 dark:text-slate-400 font-medium">
                      {key.replace(/_/g, " ")}
                    </span>
                    <span className="font-semibold text-indigo-600 dark:text-indigo-400">
                      {Math.round(val * 100)}%
                    </span>
                  </div>
                  <div className="h-2.5 w-full bg-slate-100 dark:bg-white/[0.06] rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${Math.round(val * 100)}%` }}
                      transition={{ duration: 1, delay: 0.5 }}
                      className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full"
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Tabs */}
        <div className="mt-10 border-b border-slate-200 dark:border-white/[0.06]">
          <div className="flex gap-6">
            {tabs.map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`pb-3 text-sm font-medium transition-colors relative ${
                  activeTab === tab
                    ? "text-indigo-600 dark:text-indigo-400"
                    : "text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200"
                }`}
              >
                {tab}
                {activeTab === tab && (
                  <motion.div
                    layoutId="activeTab"
                    className="absolute bottom-0 left-0 right-0 h-0.5 bg-indigo-600 dark:bg-indigo-400"
                    transition={{ type: "spring", stiffness: 300, damping: 30 }}
                  />
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Tab content */}
        <div className="py-8 pb-20">
          <AnimatePresence mode="wait">
            {activeTab === "Overview" && (
              <motion.div
                key="overview"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
                className="bg-white dark:bg-[#0f0f10] p-8 rounded-2xl shadow-sm border border-slate-100 dark:border-white/[0.04]"
              >
                <h3 className="text-xl font-semibold text-slate-900 dark:text-white mb-4">
                  About {organization.name}
                </h3>
                <p className="text-slate-600 dark:text-slate-400 leading-relaxed text-lg">
                  {organization.description}
                </p>
              </motion.div>
            )}

            {activeTab === "Products" && (
              <motion.div
                key="products"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="grid md:grid-cols-3 gap-4"
              >
                {productsLoading ? (
                  <div className="col-span-3 text-center py-8 text-slate-500">
                    Loading products...
                  </div>
                ) : products.length === 0 ? (
                  <div className="col-span-3 text-center py-8 text-slate-500">
                    No products listed yet.
                  </div>
                ) : (
                  products.map((product, i) => (
                    <div
                      key={i}
                      className="bg-white dark:bg-[#0f0f10] p-5 rounded-2xl border border-slate-100 dark:border-white/[0.04] shadow-sm hover:shadow-md transition-shadow"
                    >
                      <div className="flex justify-between items-start mb-3">
                        <h4 className="font-semibold text-slate-800 dark:text-white">
                          {product.name}
                        </h4>
                        <span
                          className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                            product.status === "Active"
                              ? "bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                              : "bg-amber-50 dark:bg-amber-500/10 text-amber-600 dark:text-amber-400"
                          }`}
                        >
                          {product.status || "Active"}
                        </span>
                      </div>
                      <p className="text-indigo-600 dark:text-indigo-400 font-bold text-lg">
                        {product.price || "Contact for pricing"}
                      </p>
                    </div>
                  ))
                )}
              </motion.div>
            )}

            {activeTab === "Team" && (
              <motion.div
                key="team"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="grid grid-cols-2 md:grid-cols-4 gap-4"
              >
                {teamLoading ? (
                  <div className="col-span-4 text-center py-8 text-slate-500">
                    Loading team...
                  </div>
                ) : team.length === 0 ? (
                  <div className="col-span-4 text-center py-8 text-slate-500">
                    No team members listed.
                  </div>
                ) : (
                  team.map((member, i) => (
                    <div
                      key={i}
                      className="bg-white dark:bg-[#0f0f10] p-4 rounded-2xl border border-slate-100 dark:border-white/[0.04] shadow-sm flex flex-col items-center text-center"
                    >
                      <div className="w-12 h-12 rounded-full bg-gradient-to-br from-slate-100 to-slate-200 dark:from-white/[0.06] dark:to-white/[0.02] flex items-center justify-center text-slate-600 dark:text-slate-300 font-bold mb-3">
                        {member.avatar || member.name.charAt(0)}
                      </div>
                      <h4 className="font-semibold text-slate-800 dark:text-white text-sm">
                        {member.name}
                      </h4>
                      <p className="text-xs text-slate-500 dark:text-slate-400">{member.role}</p>
                    </div>
                  ))
                )}
              </motion.div>
            )}

            {activeTab === "Connections" && (
              <motion.div
                key="connections"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="bg-white dark:bg-[#0f0f10] p-8 rounded-2xl shadow-sm border border-slate-100 dark:border-white/[0.04]"
              >
                <h3 className="text-xl font-semibold text-slate-900 dark:text-white mb-4">
                  Verified Partners
                </h3>
                {partnersLoading ? (
                  <div className="text-center py-8 text-slate-500">Loading partners...</div>
                ) : partners.length === 0 ? (
                  <div className="text-center py-8 text-slate-500">No partners listed.</div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {partners.map((partner, i) => (
                      <div
                        key={i}
                        className="flex items-center justify-between p-4 rounded-xl border border-slate-100 dark:border-white/[0.04] hover:bg-slate-50 dark:hover:bg-white/[0.02] transition-colors cursor-pointer group"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-slate-200 dark:bg-white/[0.06] flex items-center justify-center text-xs font-bold text-slate-500 dark:text-slate-400">
                            {partner.name.charAt(0)}
                          </div>
                          <div>
                            <span className="font-medium text-slate-700 dark:text-slate-300 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 block">
                              {partner.name}
                            </span>
                            <span className="text-xs text-slate-400 dark:text-slate-500">
                              {partner.trust_tier || "Partner"}
                            </span>
                          </div>
                        </div>
                        <ArrowUpRight className="w-4 h-4 text-slate-400 group-hover:text-indigo-500" />
                      </div>
                    ))}
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}