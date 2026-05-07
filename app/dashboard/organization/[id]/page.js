"use client";

import { motion } from "framer-motion";
import {
  Settings,
  Users,
  FileCheck,
  Package,
  LayoutGrid,
  BarChart3,
  Shield,
  ArrowUpRight,
  CheckCircle2,
  Clock,
  Plus,
  BellRing,
  TrendingUp,
} from "lucide-react";

const stats = [
  {
    title: "Trust Score",
    value: "98",
    suffix: "/100",
    change: "+2.4%",
    icon: Shield,
    color: "from-emerald-500 to-teal-500",
    sparkline: [60, 70, 65, 80, 75, 90, 98],
  },
  {
    title: "Active Members",
    value: "124",
    suffix: "",
    change: "+12 this month",
    icon: Users,
    color: "from-blue-500 to-indigo-500",
    sparkline: [80, 90, 85, 95, 100, 110, 124],
  },
  {
    title: "Listed Products",
    value: "42",
    suffix: "",
    change: "6 pending review",
    icon: Package,
    color: "from-purple-500 to-pink-500",
    sparkline: [30, 32, 35, 38, 40, 41, 42],
  },
  {
    title: "Monthly Revenue",
    value: "$128k",
    suffix: "",
    change: "+18.2% vs last month",
    icon: BarChart3,
    color: "from-amber-500 to-orange-500",
    sparkline: [90, 100, 105, 110, 115, 120, 128],
  },
];

const recentActivity = [
  {
    text: "New member John Doe joined",
    time: "2h ago",
    icon: Users,
    type: "success",
    avatar: "JD",
  },
  {
    text: "Verification docs approved",
    time: "5h ago",
    icon: CheckCircle2,
    type: "success",
    avatar: "SY",
  },
  {
    text: 'Product "Quantum SDK" pending review',
    time: "1d ago",
    icon: Clock,
    type: "warning",
    avatar: "QM",
  },
  {
    text: "Trust score recalculated",
    time: "2d ago",
    icon: Shield,
    type: "info",
    avatar: "SY",
  },
];

const managementCards = [
  {
    title: "Organization Settings",
    desc: "Update name, logo, and details",
    icon: Settings,
    href: "/dashboard/organization/1/settings",
  },
  {
    title: "Team Management",
    desc: "Invite members, assign roles",
    icon: Users,
    href: "/dashboard/organization/1/team",
  },
  {
    title: "Verification Center",
    desc: "Upload docs, view status",
    icon: FileCheck,
    href: "/dashboard/organization/1/verification",
  },
  {
    title: "Product Catalog",
    desc: "Manage listings and pricing",
    icon: Package,
    href: "/dashboard/organization/1/products",
  },
  {
    title: "Exhibition Spaces",
    desc: "Configure bookable spaces",
    icon: LayoutGrid,
    href: "/dashboard/organization/1/spaces",
  },
  {
    title: "Advanced Analytics",
    desc: "Track growth and engagement",
    icon: BarChart3,
    href: "/dashboard/organization/1/analytics",
  },
];

export default function OrganizationDashboard() {
  return (
    <div className="min-h-screen bg-slate-50/80">
      {/* Sticky top bar */}
      <div className="bg-white border-b border-slate-200 sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-bold shadow-sm">
              Q
            </div>
            <div>
              <h1 className="text-lg font-bold text-slate-900 leading-tight">
                Quantum Dynamics
              </h1>
              <p className="text-xs text-slate-500">Organization Dashboard</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button className="p-2 text-slate-500 hover:bg-slate-100 rounded-full transition-colors relative">
              <BellRing className="w-5 h-5" />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full"></span>
            </button>
            <button className="bg-indigo-600 text-white px-4 py-2 rounded-xl text-sm font-medium flex items-center gap-2 shadow-sm hover:bg-indigo-700 transition-colors">
              <Plus className="w-4 h-4" /> New Exhibition
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Header Greeting */}
        <div className="mb-8 flex items-end justify-between">
          <div>
            <h2 className="text-2xl font-bold text-slate-900">Good morning, Admin</h2>
            <p className="text-slate-500 text-sm mt-1">Here's what's happening with your organization today.</p>
          </div>
          <div className="hidden md:flex items-center gap-2 text-sm text-emerald-600 font-medium bg-emerald-50 px-3 py-1.5 rounded-full border border-emerald-100">
            <TrendingUp className="w-4 h-4" /> All Systems Operational
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
          {stats.map((stat, i) => (
            <motion.div
              key={stat.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              whileHover={{ y: -4, boxShadow: "0 12px 24px rgba(0,0,0,0.05)" }}
              className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm relative overflow-hidden group"
            >
              <div className={`absolute top-0 right-0 w-24 h-24 -mr-6 -mt-6 bg-gradient-to-br ${stat.color} opacity-10 rounded-full group-hover:scale-150 transition-transform duration-500`} />
              
              {/* Mini Sparkline visualization */}
              <div className="absolute bottom-0 left-0 right-0 h-8 flex items-end gap-[2px] px-2 opacity-20 group-hover:opacity-40 transition-opacity">
                {stat.sparkline.map((val, idx) => (
                  <div key={idx} className="flex-1 bg-indigo-500 rounded-t-sm" style={{ height: `${(val / Math.max(...stat.sparkline)) * 100}%` }}></div>
                ))}
              </div>

              <div className="flex items-center justify-between mb-3 relative z-10">
                <span className="text-sm font-medium text-slate-500">{stat.title}</span>
                <div className={`p-1.5 rounded-lg bg-gradient-to-br ${stat.color} text-white`}>
                  <stat.icon className="w-4 h-4" />
                </div>
              </div>
              <div className="relative z-10">
                <span className="text-3xl font-bold text-slate-900">{stat.value}</span>
                <span className="text-slate-400 text-lg">{stat.suffix}</span>
              </div>
              <p className="text-xs text-emerald-600 font-medium mt-2 flex items-center gap-1 relative z-10">
                <ArrowUpRight className="w-3 h-3" /> {stat.change}
              </p>
            </motion.div>
          ))}
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Management Cards Grid */}
          <div className="lg:col-span-2">
            <h2 className="text-lg font-semibold text-slate-900 mb-4">Management</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {managementCards.map((card, i) => (
                <motion.a
                  key={card.title}
                  href={card.href}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.2 + i * 0.05 }}
                  whileHover={{ scale: 1.02, borderColor: "rgba(79, 70, 229, 0.3)" }}
                  whileTap={{ scale: 0.98 }}
                  className="p-5 bg-white rounded-2xl border border-slate-100 shadow-sm text-left group focus:outline-none focus:ring-2 focus:ring-indigo-500 flex flex-col justify-between"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="p-2 bg-slate-50 rounded-xl text-slate-600 group-hover:bg-indigo-50 group-hover:text-indigo-600 transition-colors">
                      <card.icon className="w-5 h-5" />
                    </div>
                    <ArrowUpRight className="w-4 h-4 text-slate-300 group-hover:text-indigo-500 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-slate-800 group-hover:text-indigo-700 transition-colors">
                      {card.title}
                    </h3>
                    <p className="text-sm text-slate-500 mt-1">{card.desc}</p>
                  </div>
                </motion.a>
              ))}
            </div>
          </div>

          {/* Recent Activity Feed */}
          <div>
            <h2 className="text-lg font-semibold text-slate-900 mb-4">Recent Activity</h2>
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
              {recentActivity.map((item, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.4 + i * 0.1 }}
                  className="flex items-start gap-3 p-4 border-b border-slate-50 last:border-none hover:bg-slate-50/50 transition-colors"
                >
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 ${
                    item.type === "success" ? "bg-emerald-50 text-emerald-600" :
                    item.type === "warning" ? "bg-amber-50 text-amber-600" :
                    "bg-blue-50 text-blue-600"
                  }`}>
                    {item.avatar}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-slate-800 font-medium">{item.text}</p>
                    <p className="text-xs text-slate-400 mt-0.5">{item.time}</p>
                  </div>
                </motion.div>
              ))}
              <div className="p-3 text-center">
                <button className="text-sm text-indigo-600 font-medium hover:text-indigo-800 transition-colors">
                  View All Activity
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}