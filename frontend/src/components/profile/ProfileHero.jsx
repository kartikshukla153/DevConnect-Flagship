import {
  MapPin,
  Globe,
  Mail,
  BriefcaseBusiness,
  CalendarDays,
  Users,
  Code2,
  GitBranch,
  ExternalLink,
  Pencil,
  Sparkles,
  CheckCircle2,
  Plus,
} from "lucide-react";

function Stat({
  label,
  value,
}) {
  return (
    <div className="flex flex-col">
      <span className="text-2xl font-bold text-white">
        {value}
      </span>

      <span className="mt-1 text-sm text-slate-400">
        {label}
      </span>
    </div>
  );
}

function SocialButton({
  href,
  icon: Icon,
}) {
  if (!href) return null;

  return (
    <a
      href={href}
      target="_blank"
      rel="noreferrer"
      className="
        flex h-11 w-11 items-center justify-center
        rounded-xl
        border border-white/10
        bg-[#0B1220]
        text-slate-400
        transition
        duration-200
        hover:border-cyan-400/40
        hover:bg-cyan-500/10
        hover:text-cyan-300
      "
    >
      <Icon size={18} />
    </a>
  );
}

function Skill({
  children,
}) {
  return (
    <span
      className="
        rounded-xl
        border border-cyan-500/20
        bg-cyan-500/10
        px-3
        py-1.5
        text-xs
        font-medium
        text-cyan-300
      "
    >
      {children}
    </span>
  );
}

export default function ProfileHero({
  profile,
}) {
const skills = profile?.skills?.slice(0, 6) || [];

  return (
    <section className="overflow-hidden rounded-3xl border border-white/10 bg-[#111827]">

      {/* Cover */}

      <div className="relative h-56 overflow-hidden">

        <div className="absolute inset-0 bg-gradient-to-r from-[#0891B2] via-[#2563EB] to-[#4F46E5]" />

        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.18),transparent_45%)]" />

        <div className="absolute bottom-5 right-6 rounded-full border border-white/15 bg-white/10 px-4 py-2 backdrop-blur">
          <div className="flex items-center gap-2">

            <Sparkles
              size={16}
              className="text-cyan-200"
            />

            <span className="text-xs font-medium tracking-wide text-white">
              DevConnect Profile
            </span>

          </div>
        </div>

      </div>

      {/* Content */}

      <div className="px-8 pb-8">

        <div className="-mt-16 flex flex-col justify-between gap-8 xl:flex-row">

          {/* Left */}

          <div className="flex flex-col gap-6 lg:flex-row">

            {/* Avatar */}

            <div
              className="
                flex
                h-32
                w-32
                items-center
                justify-center
                rounded-full
                border-4
                border-[#111827]
                bg-cyan-400
                text-5xl
                font-black
                text-black
                shadow-xl
              "
            >
              {profile.user?.name?.charAt(0)}
            </div>

            {/* Info */}

            <div className="pt-2">

              <div className="flex flex-wrap items-center gap-3">

                <h1 className="text-4xl font-bold tracking-tight text-white">
                  {profile.user?.name}
                </h1>

                <span className="flex items-center gap-1 rounded-full border border-emerald-500/20 bg-emerald-500/10 px-3 py-1 text-xs font-semibold text-emerald-400">

                  <CheckCircle2 size={14} />

                  Available for Internship

                </span>

              </div>

              <p className="mt-2 text-lg font-medium text-cyan-400">
                @{profile.username || profile.user?.name}
              </p>

              {profile.headline && (
                <p className="mt-4 max-w-3xl text-base leading-7 text-slate-300">
                  {profile.headline}
                </p>
              )}
                            <div className="mt-5 flex flex-wrap items-center gap-5 text-sm text-slate-400">

                {profile.location && (
                  <div className="flex items-center gap-2">
                    <MapPin
                      size={16}
                      className="text-cyan-400"
                    />
                    <span>{profile.location}</span>
                  </div>
                )}

                {profile.company && (
                  <div className="flex items-center gap-2">
                    <BriefcaseBusiness
                      size={16}
                      className="text-cyan-400"
                    />
                    <span>{profile.company}</span>
                  </div>
                )}

              </div>

              {skills.length > 0 && (
                <div className="mt-6 flex flex-wrap gap-2">
                  {skills.map((skill) => (
                    <Skill key={skill}>
                      {skill}
                    </Skill>
                  ))}
                </div>
              )}

              <div className="mt-7 flex flex-wrap gap-3">

                <SocialButton
  href={profile.socialLinks?.github}
  icon={GitBranch}
/>

<SocialButton
  href={profile.socialLinks?.linkedin}
  icon={BriefcaseBusiness}
/>

<SocialButton
  href={profile.socialLinks?.portfolio}
  icon={Globe}
/>

<SocialButton
  href={profile.socialLinks?.twitter}
  icon={Users}
/>

              </div>

            </div>

          </div>

          {/* Right */}

          <div className="flex flex-col gap-4">

            <button
              onClick={() =>
                (window.location.href =
                  "/create-profile")
              }
              className="
                flex
                items-center
                justify-center
                gap-2
                rounded-2xl
                bg-cyan-400
                px-6
                py-3
                font-semibold
                text-black
                transition
                hover:bg-cyan-300
              "
            >
              <Pencil size={18} />
              Edit Profile
            </button>

            <button
              onClick={() =>
                (window.location.href =
                  "/add-experience")
              }
              className="
                flex
                items-center
                justify-center
                gap-2
                rounded-2xl
                border
                border-white/10
                bg-[#0B1220]
                px-6
                py-3
                font-medium
                text-white
                transition
                hover:border-cyan-400/40
                hover:bg-cyan-500/10
              "
            >
              <Plus size={18} />
              Add Experience
            </button>

          </div>

        </div>

        {/* Bottom Stats */}

        <div className="mt-8 grid grid-cols-2 gap-6 rounded-2xl border border-white/10 bg-[#0B1220] p-6 md:grid-cols-4">

          <Stat
            label="Projects"
            value="12"
          />

          <Stat
            label="Connections"
            value="154"
          />

          <Stat
            label="Skills"
            value={profile.skills?.length || 0}
          />

          <Stat
            label="Experience"
            value={profile.experience?.length || 0}
          />

        </div>
                {/* Highlights */}

        <div className="mt-8 grid gap-5 lg:grid-cols-3">

          <div className="rounded-2xl border border-white/10 bg-[#0F172A] p-5">

            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
              Current Focus
            </p>

            <h3 className="mt-3 text-lg font-semibold text-white">
              Building DevConnect
            </h3>

            <p className="mt-2 text-sm leading-7 text-slate-400">
              Developing a real-time collaboration platform
              with AI-powered developer workflows, project
              management and team communication.
            </p>

          </div>

          <div className="rounded-2xl border border-white/10 bg-[#0F172A] p-5">

            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
              Availability
            </p>

            <div className="mt-4 flex items-center gap-3">

              <div className="h-3 w-3 rounded-full bg-emerald-400" />

              <span className="font-medium text-white">
                Open for Internship
              </span>

            </div>

            <p className="mt-3 text-sm leading-7 text-slate-400">
              Looking for Full Stack, Backend and MERN
              opportunities. Available for Remote,
              Hybrid and On-site roles.
            </p>

          </div>

          <div className="rounded-2xl border border-white/10 bg-[#0F172A] p-5">

            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
              Profile Strength
            </p>

            <div className="mt-5">

              <div className="mb-2 flex items-center justify-between">

                <span className="text-sm text-slate-400">
                  Completion
                </span>

                <span className="font-semibold text-white">
                  82%
                </span>

              </div>

              <div className="h-2 overflow-hidden rounded-full bg-white/5">

                <div
                  className="h-full rounded-full bg-cyan-400"
                  style={{
                    width: "82%",
                  }}
                />

              </div>

            </div>

            <p className="mt-4 text-sm leading-7 text-slate-400">
              Complete your portfolio, social links and
              experience to improve discoverability.
            </p>

          </div>

        </div>
              </div>
    </section>
  );
}