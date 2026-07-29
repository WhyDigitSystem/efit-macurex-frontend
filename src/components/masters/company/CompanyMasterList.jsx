import React, { useEffect, useState } from "react";
import {
  ArrowLeft,
  Building2,
  Mail,
  Phone,
  Globe,
  MapPin,
  User,
  ShieldCheck,
  CreditCard,
  RefreshCw,
  Pencil,
  Users,
  HardDrive,
  Clock,
  Briefcase,
  FileText,
} from "lucide-react";
import { companySetupAPI } from "../../../api/companySetupApi";

/* ---------------------------------------------------------------------------- */
/* Small building blocks                                                        */
const toImageSrc = (logo) => {
  if (!logo) return null;
  // Already a full URL or data URI — use as-is
  if (logo.startsWith("http") || logo.startsWith("data:")) return logo;
  // Raw base64 string from the API — wrap it in a data URI
  return `data:image/png;base64,${logo}`;
};

const InfoRow = ({ icon: Icon, label, value }) => (
  <div className="flex items-center gap-2.5 py-1.5">
    {Icon && (
      <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-md bg-gray-100 dark:bg-gray-700/60">
        <Icon className="h-3.5 w-3.5 text-gray-500 dark:text-gray-400" />
      </span>
    )}
    <div className="min-w-0">
      <p className="text-[11px] leading-tight text-gray-500 dark:text-gray-400">
        {label}
      </p>
      <p className="text-xs font-medium leading-tight text-gray-900 dark:text-gray-100 break-words">
        {(value ?? value === 0) ? value : "—"}
      </p>
    </div>
  </div>
);

const SectionCard = ({ title, icon: Icon, children }) => (
  <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4">
    <div className="flex items-center gap-1.5 mb-3 pb-2 border-b border-gray-100 dark:border-gray-700">
      {Icon && (
        <Icon className="h-3.5 w-3.5 text-blue-600 dark:text-blue-400" />
      )}
      <h3 className="text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">
        {title}
      </h3>
    </div>
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-1">
      {children}
    </div>
  </div>
);

/* ---------------------------------------------------------------------------- */
/* Helpers                                                                      */

const isActive = (val) => val === true || val === "Active";

const initials = (name = "") =>
  name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase())
    .join("") || "C";

/* ---------------------------------------------------------------------------- */
/* Main component                                                               */

const CompanyMasterList = ({ onEdit, onBack }) => {
  const [company, setCompany] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const loadCompany = async () => {
    setLoading(true);
    setError(null);

    try {
      const companyId = localStorage.getItem("orgId");

      if (!companyId) {
        setError("No company ID found for this account.");
        setCompany(null);
        return;
      }

      const result = await companySetupAPI.getCompanyById(companyId);
      setCompany(result || null);

      if (!result) {
        setError("Company not found.");
      }
    } catch (err) {
      console.error("Error loading company:", err);
      setError("Failed to load company details.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCompany();
  }, []);

  const handleUpdate = () => {
    if (company) onEdit(company);
  };

  return (
    <div className="mx-auto w-full max-w-5xl space-y-3 p-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          {onBack && (
            <button
              onClick={onBack}
              className="flex h-7 w-7 items-center justify-center rounded-md text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 hover:text-gray-900 dark:hover:text-white transition-colors"
            >
              <ArrowLeft className="h-4 w-4" />
            </button>
          )}
          <h2 className="text-base font-semibold text-gray-900 dark:text-white">
            Company Profile
          </h2>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleUpdate}
            disabled={loading || !company}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs text-white bg-blue-600 hover:bg-blue-700 dark:bg-blue-600 dark:hover:bg-blue-500 disabled:opacity-60 disabled:cursor-not-allowed transition-colors"
          >
            <Pencil className="h-3 w-3" />
            Update Company
          </button>
        </div>
      </div>

      {/* Loading state */}
      {loading && (
        <div className="flex flex-col items-center justify-center gap-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-10 text-center">
          <RefreshCw className="h-4 w-4 animate-spin text-gray-400" />
          <p className="text-xs text-gray-500 dark:text-gray-400">
            Loading company details...
          </p>
        </div>
      )}

      {/* Error state */}
      {!loading && error && (
        <div className="flex flex-col items-center justify-center gap-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-10 text-center">
          <p className="text-xs text-red-500 dark:text-red-400">{error}</p>
          <button
            onClick={loadCompany}
            className="text-xs text-blue-600 dark:text-blue-400 hover:underline"
          >
            Try again
          </button>
        </div>
      )}

      {/* Profile content */}
      {!loading && !error && company && (
        <>
          {/* Identity card */}
          <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-2 flex items-center gap-4">
            {company.companyLogo ? (
              <img
                src={toImageSrc(company.companyLogo)}
                alt={company.companyName}
                className="h-14 w-14 rounded-lg object-contain border border-gray-200 dark:border-gray-700 bg-white shrink-0"
              />
            ) : (
              <div className="h-14 w-14 rounded-lg bg-blue-600 text-white flex items-center justify-center text-lg font-semibold shrink-0">
                {initials(company.companyName)}
              </div>
            )}

            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="text-sm font-semibold text-gray-900 dark:text-white truncate">
                  {company.companyName}
                </h3>
                <span
                  className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[9px] font-medium uppercase tracking-wide ${
                    isActive(company.active)
                      ? "bg-emerald-500/15 text-emerald-300"
                      : "bg-white/10 text-white/60"
                  }`}
                >
                  <span
                    className={`h-1.5 w-1.5 rounded-full ${
                      isActive(company.active)
                        ? "bg-emerald-400 shadow-[0_0_3px_1px_rgba(74,222,128,0.7)] animate-pulse"
                        : "bg-gray-400 shadow-[0_0_2px_0.5px_rgba(156,163,175,0.5)] animate-pulse"
                    }`}
                  />
                  {isActive(company.active) ? "Active" : "Inactive"}
                </span>
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5 flex items-center gap-1.5 flex-wrap">
                {company.companyCode && (
                  <span className="inline-flex items-center gap-1">
                    <Briefcase className="h-3 w-3 text-gray-400" />
                    {company.companyCode}
                  </span>
                )}
                {company.industryType && (
                  <span className="inline-flex items-center gap-1">
                    <span className="text-gray-300 dark:text-gray-600">•</span>
                    {company.industryType}
                  </span>
                )}
              </p>
            </div>
          </div>

          {/* Details Sections */}

          {/* Company Details */}
          <SectionCard title="Company Details" icon={Building2}>
            <div className="col-span-2 grid grid-cols-4 gap-2">
              <InfoRow
                icon={Building2}
                label="Company Name"
                value={company.companyName}
              />

              <InfoRow
                icon={Briefcase}
                label="Company Code"
                value={company.companyCode}
              />

              <InfoRow
                icon={Mail}
                label="Company Email"
                value={company.email}
              />

              <InfoRow
                icon={Phone}
                label="Phone No"
                value={company.adminMobileNo}
              />

              <InfoRow icon={User} label="CEO" value={company.ceo} />

              <InfoRow
                icon={Users}
                label="Company Size"
                value={company.companySize}
              />

              <InfoRow
                icon={Briefcase}
                label="Industry Type"
                value={company.industryType}
              />

              <InfoRow
                icon={Globe}
                label="Official Website"
                value={company.officialWebsite}
              />

              <InfoRow
                icon={MapPin}
                label="Address"
                value={company.registeredAddress}
              />

              <InfoRow
                icon={Globe}
                label="Country"
                value={
                  company.country && typeof company.country === "object"
                    ? company.country.countryName
                    : company.country
                }
              />

              <InfoRow
                icon={MapPin}
                label="State"
                value={
                  company.state && typeof company.state === "object"
                    ? company.state.stateName
                    : company.state
                }
              />

              <InfoRow
                icon={MapPin}
                label="City"
                value={
                  company.city && typeof company.city === "object"
                    ? company.city.cityName
                    : company.city
                }
              />

              <InfoRow icon={MapPin} label="Pincode" value={company.pincode} />

              <InfoRow icon={FileText} label="PAN No" value={company.panNo} />

              <InfoRow icon={ShieldCheck} label="GST" value={company.gst} />

              <InfoRow icon={FileText} label="CIN" value={company.cin} />

              <InfoRow
                icon={ShieldCheck}
                label="Status"
                value={isActive(company.active) ? "Active" : "Inactive"}
              />
            </div>
          </SectionCard>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 mt-3">
            {/* Subscription */}
            <SectionCard title="Subscription Details" icon={CreditCard}>
              <div className="col-span-2 grid grid-cols-4 gap-4">
                <InfoRow
                  icon={CreditCard}
                  label="Plan"
                  value={company.selectPlan}
                />

                <InfoRow
                  icon={Clock}
                  label="Trial Period"
                  value={
                    company.trialPeriod !== null &&
                    company.trialPeriod !== undefined
                      ? `${company.trialPeriod} Days`
                      : "—"
                  }
                />

                <InfoRow
                  icon={Users}
                  label="Max Users"
                  value={company.maxUsers}
                />

                <InfoRow
                  icon={HardDrive}
                  label="Storage"
                  value={
                    company.storageLimit
                      ? `${company.storageLimit} GB`
                      : "Unlimited"
                  }
                />
              </div>
            </SectionCard>

            {/* Admin */}
            <SectionCard title="Admin Details" icon={User}>
              <div className="col-span-2 grid grid-cols-3 gap-4">
                <InfoRow
                  icon={User}
                  label="Admin Name"
                  value={company.adminName}
                />

                <InfoRow
                  icon={Mail}
                  label="Admin Email"
                  value={company.adminEmail}
                />

                <InfoRow
                  icon={Phone}
                  label="Admin Mobile"
                  value={company.adminMobileNo}
                />

                {/* Empty placeholder keeps alignment */}
                <div></div>
              </div>
            </SectionCard>
          </div>

          {/* Terms & Conditions */}
          <div className="mt-3">
            <SectionCard title="Terms & Conditions" icon={FileText}>
              <div className="col-span-2">
                <p className="text-sm text-gray-700 dark:text-gray-300 whitespace-pre-wrap leading-6">
                  {company.termsAndConditions ||
                    "No Terms & Conditions available."}
                </p>
              </div>
            </SectionCard>
          </div>
        </>
      )}
    </div>
  );
};

export default CompanyMasterList;
