/**
 * Trust & Verification System Components
 * Pattern from: Alibaba Trust, IndiaMART Trust, Stripe Identity
 *
 * Features:
 * - Trust score visualization
 * - Verification badges
 * - Reputation system
 * - Trust indicators
 */

'use client';

import { motion } from 'framer-motion';
import { useMemo } from 'react';
import {
  Shield,
  CheckCircle,
  Clock,
  AlertTriangle,
  Star,
  TrendingUp,
  BadgeCheck,
  BadgeDollarSign,
  FileBadge,
  Building2,
  User,
  Phone,
  Mail,
} from 'lucide-react';
import { PhysicsCard } from '@/components/motion';
import { ProgressRing } from '@/components/data-display';

const springTransition = {
  type: 'spring',
  stiffness: 350,
  damping: 28,
};

/**
 * Trust Score Display
 */
export function TrustScore({
  score = 0,
  maxScore = 100,
  size = 120,
  showDetails = true,
  className = '',
}) {
  const percentage = useMemo(() => Math.min((score / maxScore) * 100, 100), [score, maxScore]);

  const getTrustLevel = (score) => {
    if (score >= 90) return { label: 'Excellent', color: '#10b981' };
    if (score >= 70) return { label: 'Good', color: '#3b82f6' };
    if (score >= 50) return { label: 'Fair', color: '#f59e0b' };
    return { label: 'New', color: '#94a3b8' };
  };

  const trustLevel = getTrustLevel(score);

  return (
    <div className={`text-center ${className}`}>
      <div className="relative inline-block">
        <ProgressRing
          value={percentage}
          size={size}
          strokeWidth={8}
          color={trustLevel.color}
        />
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-2xl font-bold">{score}</span>
          <span className="text-xs text-muted-foreground">/ {maxScore}</span>
        </div>
      </div>
      {showDetails && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={springTransition}
          className="mt-4"
        >
          <span
            className="px-3 py-1 rounded-full text-sm font-medium"
            style={{ backgroundColor: `${trustLevel.color}20`, color: trustLevel.color }}
          >
            {trustLevel.label}
          </span>
          <p className="text-sm text-muted-foreground mt-2">Trust Score</p>
        </motion.div>
      )}
    </div>
  );
}

/**
 * Verification Badge
 */
export function VerificationBadge({
  level = 'basic', // 'basic' | 'business' | 'kyc' | 'trusted'
  size = 'md', // 'sm' | 'md' | 'lg'
  showLabel = true,
  className = '',
}) {
  const levels = {
    basic: {
      label: 'Email Verified',
      icon: Mail,
      color: '#3b82f6',
      description: 'Email address verified',
    },
    business: {
      label: 'Business Verified',
      icon: Building2,
      color: '#8b5cf6',
      description: 'Business documents verified',
    },
    kyc: {
      label: 'KYC Verified',
      icon: FileBadge,
      color: '#10b981',
      description: 'Identity verification complete',
    },
    trusted: {
      label: 'Trusted Supplier',
      icon: Shield,
      color: '#f59e0b',
      description: 'Top rated and verified',
    },
  };

  const config = levels[level] || levels.basic;
  const Icon = config.icon;

  const sizes = {
    sm: { badge: 'w-5 h-5', icon: 'w-3 h-3', text: 'text-xs' },
    md: { badge: 'w-6 h-6', icon: 'w-4 h-4', text: 'text-sm' },
    lg: { badge: 'w-8 h-8', icon: 'w-5 h-5', text: 'text-base' },
  };

  return (
    <motion.span
      initial={{ scale: 0 }}
      animate={{ scale: 1 }}
      whileHover={{ scale: 1.1 }}
      className={`
        inline-flex items-center gap-1.5 px-2 py-1 rounded-full
        ${sizes[size].text} font-medium
      `}
      style={{ backgroundColor: `${config.color}15`, color: config.color }}
      title={config.description}
    >
      <div
        className={`${sizes[size].badge} rounded-full flex items-center justify-center`}
        style={{ backgroundColor: config.color }}
      >
        <Icon className={`${sizes[size].icon} text-white`} />
      </div>
      {showLabel && <span>{config.label}</span>}
    </motion.span>
  );
}

/**
 * Trust Card - detailed trust information
 */
export function TrustCard({
  user,
  className = '',
}) {
  const {
    trustScore,
    verificationLevel,
    memberSince,
    completedDeals,
    responseRate,
    onTimeDelivery,
  } = user;

  return (
    <PhysicsCard className={`card-premium p-6 ${className}`}>
      <div className="flex items-start gap-6">
        {/* Trust Score */}
        <TrustScore score={trustScore} size={100} showDetails={false} />

        {/* Details */}
        <div className="flex-1 space-y-4">
          <div>
            <h3 className="font-bold">Trust Profile</h3>
            <div className="flex flex-wrap gap-2 mt-2">
              <VerificationBadge level={verificationLevel} size="sm" />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-xs text-muted-foreground">Member Since</p>
              <p className="font-medium">{memberSince}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Completed Deals</p>
              <p className="font-medium">{completedDeals}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Response Rate</p>
              <p className="font-medium">{responseRate}%</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">On-Time Delivery</p>
              <p className="font-medium">{onTimeDelivery}%</p>
            </div>
          </div>
        </div>
      </div>
    </PhysicsCard>
  );
}

/**
 * Trust Indicator Dot
 */
export function TrustDot({
  score = 0,
  className = '',
}) {
  const getColor = (score) => {
    if (score >= 90) return '#10b981';
    if (score >= 70) return '#3b82f6';
    if (score >= 50) return '#f59e0b';
    return '#94a3b8';
  };

  return (
    <motion.span
      initial={{ scale: 0 }}
      animate={{ scale: 1 }}
      className={`w-2 h-2 rounded-full ${className}`}
      style={{ backgroundColor: getColor(score) }}
      title={`Trust: ${score}`}
    />
  );
}

/**
 * Trust Badges Grid
 */
export function TrustBadgesGrid({
  badges = [],
  className = '',
}) {
  return (
    <div className={`grid grid-cols-2 sm:grid-cols-4 gap-4 ${className}`}>
      {badges.map((badge, index) => (
        <motion.div
          key={badge.id}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ ...springTransition, delay: index * 0.1 }}
          className="card-premium p-4 text-center"
        >
          <div className="text-2xl mb-2">{badge.icon}</div>
          <p className="font-semibold text-sm">{badge.label}</p>
          <p className="text-xs text-muted-foreground mt-1">{badge.description}</p>
        </motion.div>
      ))}
    </div>
  );
}

/**
 * Deal Safety Indicator
 */
export function DealSafetyIndicator({
  escrowProtected = true,
  buyerProtection = true,
  verifiedSupplier = true,
  className = '',
}) {
  return (
    <PhysicsCard className={`card-premium p-4 ${className}`}>
      <div className="flex items-center gap-3 mb-4">
        <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center">
          <Shield className="w-5 h-5 text-emerald-500" />
        </div>
        <div>
          <h4 className="font-semibold">Deal Protection</h4>
          <p className="text-xs text-muted-foreground">Your transaction is protected</p>
        </div>
      </div>

      <div className="space-y-2">
        {escrowProtected && (
          <div className="flex items-center gap-2 text-sm">
            <CheckCircle className="w-4 h-4 text-emerald-500" />
            <span>Escrow Payment Protection</span>
          </div>
        )}
        {buyerProtection && (
          <div className="flex items-center gap-2 text-sm">
            <CheckCircle className="w-4 h-4 text-emerald-500" />
            <span>Buyer Protection Policy</span>
          </div>
        )}
        {verifiedSupplier && (
          <div className="flex items-center gap-2 text-sm">
            <CheckCircle className="w-4 h-4 text-emerald-500" />
            <span>Verified Supplier</span>
          </div>
        )}
      </div>
    </PhysicsCard>
  );
}

/**
 * Response Time Indicator
 */
export function ResponseTimeIndicator({
  responseRate,
  avgResponseTime,
  className = '',
}) {
  return (
    <div className={`flex items-center gap-4 ${className}`}>
      <div className="text-center">
        <p className="text-2xl font-bold text-primary">{responseRate}%</p>
        <p className="text-xs text-muted-foreground">Response Rate</p>
      </div>
      <div className="h-8 w-px bg-gray-200 dark:bg-gray-700" />
      <div className="text-center">
        <p className="text-2xl font-bold">{avgResponseTime}</p>
        <p className="text-xs text-muted-foreground">Avg Response</p>
      </div>
    </div>
  );
}
