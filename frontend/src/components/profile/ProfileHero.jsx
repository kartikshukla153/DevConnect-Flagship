import {
  BriefcaseBusiness,
  CheckCircle2,
  Edit3,
  ExternalLink,
  Globe,
  MapPin,
  Plus,
  Users,
} from "lucide-react";

function Stat({ label, value }) {
  return (
    <div className="min-w-0">
      <p className="text-2xl font-bold tracking-tight text-white">
        {value}
      </p>

      <p className="mt-1 text-sm text-slate-500">
        {label}
      </p>
    </div>
  );
}

function SocialButton({ href, icon: Icon, label }) {
  if (!href) return null;

  return (
    <a
      href={href}
      target="_blank"
      rel="noreferrer"
      aria-label={label}
      title={label}
      className="
        flex h-11 w-11 items-center justify-center
        rounded-xl
        border border-white/10
        bg-[#0B1220]
        text-slate-400
        transition-all duration-200
        hover:-translate-y-0.5
        hover:border-cyan-400/40
        hover:bg-cyan-500/10
        hover:text-cyan-300
      "
    >
      <Icon size={18} />
    </a>
  );
}

function Skill({ children }) {
  return (
    <span
      className="
        rounded-xl
        border border-cyan-500/20
        bg-cyan-500/10
        px-3 py-1.5
        text-xs font-medium
        text-cyan-300
      "
    >
      {children}
    </span>
  );
}

function Signal({ label }) {
  return (
    <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.03] px-3 py-1.5 text-xs font-medium text-slate-400">
      <span className="h-1.5 w-1.5 rounded-full bg-cyan-400" />
      {label}
    </span>
  );
}

function calculateProfileStrength(profile) {
  if (!profile) return 0;

  const user = profile.user || {};
  const socialLinks = profile.socialLinks || {};

  const checks = [
    Boolean(user.name),
    Boolean(profile.username?.trim()),
    Boolean(profile.headline?.trim()),
    Boolean(profile.bio?.trim()),
    Array.isArray(profile.skills) && profile.skills.length > 0,
    Boolean(profile.location?.trim()),
    Array.isArray(profile.experience) &&
      profile.experience.length > 0,
    Boolean(socialLinks.github),
    Boolean(socialLinks.linkedin),
    Boolean(socialLinks.portfolio),
  ];

  const completed = checks.filter(Boolean).length;

  return Math.round((completed / checks.length) * 100);
}

export default function ProfileHero({ profile }) {
  const user = profile?.user || {};

  const skills = Array.isArray(profile?.skills)
    ? profile.skills
    : [];

  const experience = Array.isArray(profile?.experience)
    ? profile.experience
    : [];

  const projects = Array.isArray(profile?.projects)
    ? profile.projects
    : [];

  const socialLinks = profile?.socialLinks || {};

  const name = user.name || "Developer";

  const username =
    profile?.username?.trim() ||
    name.toLowerCase().replace(/\s+/g, "");

  const headline =
    profile?.headline?.trim() ||
    "Full Stack Developer building practical, scalable software.";

  const location = profile?.location?.trim();

  const availability =
    profile?.availability?.trim() ||
    "Open to opportunities";

  const projectCount = projects.length;

  const connectionCount = Array.isArray(user.connections)
    ? user.connections.length
    : 0;

  const profileInitial = name.charAt(0).toUpperCase();

  const profileStrength = calculateProfileStrength(profile);

  return (
    <section className="overflow-hidden rounded-3xl border border-white/10 bg-[#111827] shadow-2xl">

      {/* COVER */}

      <div className="relative h-48 overflow-hidden sm:h-56">
        <div className="absolute inset-0 bg-gradient-to-r from-cyan-700 via-blue-700 to-indigo-700" />

        <div className="absolute inset-0 bg-[radial-gradient(circle_at_15%_20%,rgba(255,255,255,0.14),transparent_30%),radial-gradient(circle_at_85%_20%,rgba(255,255,255,0.12),transparent_35%)]" />

        <div className="absolute inset-0 opacity-30">
          <div className="absolute -right-20 -top-32 h-80 w-80 rounded-full border border-white/20" />
          <div className="absolute -right-8 -top-20 h-64 w-64 rounded-full border border-white/10" />
        </div>

        <div className="absolute bottom-5 right-5 sm:right-6">
          <div className="flex items-center gap-2 rounded-full border border-white/15 bg-black/20 px-4 py-2 backdrop-blur-xl">
            <span className="h-2 w-2 rounded-full bg-cyan-300 shadow-[0_0_10px_rgba(103,232,249,0.8)]" />

            <span className="text-xs font-medium tracking-wide text-white/90">
              Developer Profile
            </span>
          </div>
        </div>
      </div>

      {/* CONTENT */}

      <div className="px-5 pb-7 sm:px-8 sm:pb-8">

        <div className="-mt-16 flex flex-col gap-7 xl:flex-row xl:justify-between">

          {/* IDENTITY */}

          <div className="flex min-w-0 flex-col gap-5 sm:flex-row">

            {/* AVATAR */}

            <div
              className="
                relative flex h-32 w-32 shrink-0
                items-center justify-center
                rounded-full
                border-4 border-[#111827]
                bg-gradient-to-br from-cyan-300 to-cyan-500
                text-5xl font-black text-slate-950
                shadow-2xl
              "
            >
              {user.profilePicture ? (
                <img
                  src={user.profilePicture}
                  alt={`${name} profile`}
                  className="h-full w-full rounded-full object-cover"
                />
              ) : (
                profileInitial
              )}

              <div
                className="
                  absolute bottom-1 right-1
                  flex h-7 w-7 items-center justify-center
                  rounded-full
                  border-4 border-[#111827]
                  bg-emerald-400
                "
                title="Active developer"
              >
                <span className="h-2 w-2 rounded-full bg-emerald-950" />
              </div>
            </div>

            {/* INFO */}

            <div className="min-w-0 pt-1 sm:pt-16">

              <div className="flex flex-wrap items-center gap-3">
                <h1 className="break-words text-3xl font-bold tracking-tight text-white sm:text-4xl">
                  {name}
                </h1>

                <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-500/20 bg-emerald-500/10 px-3 py-1 text-xs font-semibold text-emerald-400">
                  <CheckCircle2 size={14} />
                  {availability}
                </span>
              </div>

              <p className="mt-2 text-base font-medium text-cyan-400">
                @{username}
              </p>

              <p className="mt-4 max-w-3xl text-base leading-7 text-slate-300">
                {headline}
              </p>

              {/* METADATA */}

              <div className="mt-5 flex flex-wrap items-center gap-x-5 gap-y-3 text-sm text-slate-400">

                {location && (
                  <div className="flex items-center gap-2">
                    <MapPin
                      size={16}
                      className="shrink-0 text-cyan-400"
                    />

                    <span>{location}</span>
                  </div>
                )}

                {profile?.experience?.[0]?.company && (
                  <div className="flex items-center gap-2">
                    <BriefcaseBusiness
                      size={16}
                      className="shrink-0 text-cyan-400"
                    />

                    <span>
                      {profile.experience[0].company}
                    </span>
                  </div>
                )}

                {user.email && (
                  <div className="flex items-center gap-2">
                    <span className="text-slate-600">
                      •
                    </span>

                    <span className="truncate">
                      {user.email}
                    </span>
                  </div>
                )}

              </div>

              {/* SKILLS */}

              {skills.length > 0 && (
                <div className="mt-6 flex max-w-3xl flex-wrap gap-2">
                  {skills.slice(0, 8).map((skill, index) => (
                    <Skill key={`${skill}-${index}`}>
                      {skill}
                    </Skill>
                  ))}

                  {skills.length > 8 && (
                    <span className="rounded-xl border border-white/10 bg-white/5 px-3 py-1.5 text-xs font-medium text-slate-400">
                      +{skills.length - 8} more
                    </span>
                  )}
                </div>
              )}

              {/* SOCIAL LINKS */}

              <div className="mt-6 flex flex-wrap gap-3">

                <SocialButton
                  href={socialLinks.github}
                  icon={ExternalLink}
                  label="GitHub"
                />

                <SocialButton
                  href={socialLinks.linkedin}
                  icon={BriefcaseBusiness}
                  label="LinkedIn"
                />

                <SocialButton
                  href={socialLinks.portfolio}
                  icon={Globe}
                  label="Portfolio"
                />

                {socialLinks.twitter && (
                  <SocialButton
                    href={socialLinks.twitter}
                    icon={Users}
                    label="Twitter / X"
                  />
                )}

              </div>
            </div>
          </div>

          {/* ACTIONS */}

          <div className="flex shrink-0 flex-col gap-3 xl:pt-16">

            <button
              onClick={() => {
                window.location.href =
                  "/create-profile";
              }}
              className="
                inline-flex items-center justify-center gap-2
                rounded-2xl
                bg-cyan-400
                px-6 py-3
                text-sm font-semibold text-slate-950
                shadow-lg shadow-cyan-500/10
                transition-all duration-200
                hover:-translate-y-0.5
                hover:bg-cyan-300
              "
            >
              <Edit3 size={17} />
              Edit Profile
            </button>

            <button
              onClick={() => {
                window.location.href =
                  "/add-experience";
              }}
              className="
                inline-flex items-center justify-center gap-2
                rounded-2xl
                border border-white/10
                bg-[#0B1220]
                px-6 py-3
                text-sm font-medium text-white
                transition-all duration-200
                hover:-translate-y-0.5
                hover:border-cyan-400/30
                hover:bg-cyan-500/10
              "
            >
              <Plus size={17} />
              Add Experience
            </button>

          </div>
        </div>

        {/* STATS */}

        <div className="mt-8 grid grid-cols-2 divide-x divide-white/10 rounded-2xl border border-white/10 bg-[#0B1220] p-5 md:grid-cols-4">

          <div className="px-3 first:pl-0 md:px-5">
            <Stat
              label="Projects"
              value={projectCount}
            />
          </div>

          <div className="px-3 md:px-5">
            <Stat
              label="Connections"
              value={connectionCount}
            />
          </div>

          <div className="px-3 md:px-5">
            <Stat
              label="Skills"
              value={skills.length}
            />
          </div>

          <div className="px-3 last:pr-0 md:px-5">
            <Stat
              label="Experience"
              value={experience.length}
            />
          </div>

        </div>

        {/* HIGHLIGHTS */}

        <div className="mt-8 grid gap-5 lg:grid-cols-3">

          {/* CURRENT FOCUS */}

          <div className="rounded-2xl border border-white/10 bg-[#0F172A] p-5 transition-colors hover:border-white/15">

            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
              Current Focus
            </p>

            <h3 className="mt-3 text-lg font-semibold text-white">
              {headline}
            </h3>

            <p className="mt-2 text-sm leading-7 text-slate-400">
              {profile?.bio?.trim()
                ? profile.bio
                : "Building software, collaborating with developers and growing through real-world engineering work."}
            </p>

          </div>

          {/* AVAILABILITY */}

          <div className="rounded-2xl border border-white/10 bg-[#0F172A] p-5 transition-colors hover:border-white/15">

            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
              Availability
            </p>

            <div className="mt-4 flex items-center gap-3">

              <div className="relative flex h-3 w-3">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-40" />

                <span className="relative inline-flex h-3 w-3 rounded-full bg-emerald-400" />
              </div>

              <span className="font-medium text-white">
                {availability}
              </span>

            </div>

            <p className="mt-3 text-sm leading-7 text-slate-400">
              Open to connecting with developers,
              teams, recruiters and companies through
              DevConnect.
            </p>

          </div>

          {/* PROFILE STRENGTH */}

          <div className="rounded-2xl border border-white/10 bg-[#0F172A] p-5 transition-colors hover:border-white/15">

            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
              Profile Strength
            </p>

            <div className="mt-5">

              <div className="mb-2 flex items-center justify-between">

                <span className="text-sm text-slate-400">
                  Completion
                </span>

                <span className="font-semibold text-cyan-300">
                  {profileStrength}%
                </span>

              </div>

              <div className="h-2 overflow-hidden rounded-full bg-white/5">

                <div
                  className="h-full rounded-full bg-gradient-to-r from-cyan-400 to-sky-500 transition-all duration-700"
                  style={{
                    width: `${profileStrength}%`,
                  }}
                />

              </div>
            </div>

            <p className="mt-4 text-sm leading-7 text-slate-400">
              Keep your bio, skills, experience and
              professional links updated to make your
              profile more useful.
            </p>

          </div>
        </div>

        {/* PROFILE SIGNALS */}

        <div className="mt-5 flex flex-wrap items-center gap-3">

          {profile?.bio?.trim() && (
            <Signal label="Bio added" />
          )}

          {skills.length > 0 && (
            <Signal
              label={`${skills.length} skills`}
            />
          )}

          {experience.length > 0 && (
            <Signal
              label={`${experience.length} experience ${
                experience.length === 1
                  ? "entry"
                  : "entries"
              }`}
            />
          )}

          {socialLinks.github ||
          socialLinks.linkedin ||
          socialLinks.portfolio ? (
            <Signal label="Professional links" />
          ) : null}

          {projectCount > 0 && (
            <Signal
              label={`${projectCount} ${
                projectCount === 1
                  ? "project"
                  : "projects"
              }`}
            />
          )}

          {connectionCount > 0 && (
            <Signal
              label={`${connectionCount} ${
                connectionCount === 1
                  ? "connection"
                  : "connections"
              }`}
            />
          )}

        </div>
      </div>
    </section>
  );
}