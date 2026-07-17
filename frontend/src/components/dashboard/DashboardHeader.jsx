function DashboardHeader() {
  const user = JSON.parse(localStorage.getItem("user") || "{}");

  return (
    <div className="rounded-3xl overflow-hidden border border-cyan-500/20 bg-gradient-to-r from-cyan-600 via-sky-600 to-indigo-700 p-10">

      <p className="text-cyan-100">
        Welcome back
      </p>

      <h1 className="mt-2 text-5xl font-black text-white">
        {user.name || "Developer"}
      </h1>

      <p className="mt-5 max-w-3xl text-cyan-50/90 leading-8">
        Build products, collaborate with developers,
        contribute to projects and grow your engineering
        profile with DevConnect.
      </p>

    </div>
  );
}

export default DashboardHeader;