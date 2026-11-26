"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import API from "../../lib/api";
import toast from "react-hot-toast"
import Swal from "sweetalert2"
import Loader from "../components/Loader";

export default function PostJob() {
  const router = useRouter();

  // Form state
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [location, setLocation] = useState("");
  const [salary, setSalary] = useState("");
  const [skills, setSkills] = useState("");
  const [jobType, setJobType] = useState("Full-Time");
  const [locationType, setLocationType] = useState("On-site");
  const [loading, setLoading] = useState(false);

  // Jobs list state
  const [jobs, setJobs] = useState([]);
  const [jobsLoading, setJobsLoading] = useState(true);

  // Messages modal state
  const [selectedJobMessages, setSelectedJobMessages] = useState([]);
  const [showMessages, setShowMessages] = useState(false);

  // ✅ Check login and role on page load
  useEffect(() => {
    const access = localStorage.getItem("access");
    const role = localStorage.getItem("role");

    if (!access) {
      toast.error("You must log in first!");
      router.push("/login");
      return;
    }

    if (role !== "employer") {
      toast.error("Only employers can post jobs!");
      router.push("/joblist");
      return;
    }

    // Fetch jobs after verifying user
    fetchJobs();
  }, [router]);

  // Fetch jobs posted by this employer
  const fetchJobs = async () => {
    const token = localStorage.getItem("access");
    if (!token) return;

    try {
      setJobsLoading(true);
      const res = await API.get("/jobs/", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setJobs(res.data);
    } catch (err) {
  if (err.response?.status === 401) {
    localStorage.clear();
    window.location.href = "/login";
    return;
  }
 } finally {
      setJobsLoading(false);
    }
  };

  // Handle posting a job
  const handleSubmit = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem("access");
    if (!token) return;

    try {
      setLoading(true);

      const jobData = {
        title: title.trim(),
        description: description.trim(),
        location: location.trim(),
        salary: parseInt(salary.replace(/,/g, ""), 10),
        skills: skills.trim(),
        job_type: jobType,
        location_type: locationType,
      };

      await API.post("/jobs/", jobData, {
        headers: { Authorization: `Bearer ${token}` },
      });

      toast.success("Job posted successfully!");
      setTitle("");
      setDescription("");
      setLocation("");
      setSalary("");
      setSkills("");
      setJobType("Full-Time");
      setLocationType("On-site");
      fetchJobs();
    } catch (error) {
      console.error(error.response || error);
      toast.error(
        "There was a problem while posting job. Make sure you are logged in as an employer and your company exists."
      );
    } finally {
      setLoading(false);
    }
  };

  // Delete a job
// Delete a job
  const handleDelete = async (jobId) => {
    const token = localStorage.getItem("access");
    if (!token) return;

    // SweetAlert2 Confirmation Popup
    Swal.fire({
      title: "Are you sure?",
      text: "You won't be able to revert this!",
      // icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#ef4444", // Tailwind red-500
      cancelButtonColor: "#6366f1",  // Tailwind indigo-500
      confirmButtonText: "Yes, delete it!",
      background: "#1e293b",         // Optional: Dark theme to match your UI
      color: "#fff"                  // Optional: Text color for dark theme
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          await API.delete(`/jobs/${jobId}/`, {
            headers: { Authorization: `Bearer ${token}` },
          }); 

    
      toast.success("Job deleted!");
      fetchJobs();
   } catch (err) {
          console.error(err.response || err);
          toast.error("Failed to delete the job.");
        }
      }
    });
  };

  // Fetch messages for a job
  const handleViewMessages = async (jobId) => {
    const token = localStorage.getItem("access");
    if (!token) return;

    try {
      const res = await API.get(`/applications/?job=${jobId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setSelectedJobMessages(res.data); // Assuming res.data contains messages or applications
      setShowMessages(true);
    } catch (err) {
      console.error(err.response || err);
      toast.error("Failed to fetch messages for this job.");
    }
  };


const handleSalaryChange = (e) => {
    const value = e.target.value;
    // Remove anything that isn't a digit
    const numericValue = value.replace(/\D/g, "");
    
    // Format with commas
    const formattedValue = numericValue 
      ? Number(numericValue).toLocaleString("en-US") 
      : "";
      
    setSalary(formattedValue);
  };

  if (jobsLoading) return <Loader />;
  if (loading) return <Loader />;

  return (
  <main className="relative min-h-screen w-full overflow-hidden">
      <div 
        className="absolute inset-0 z-0 animate-kenburns bg-cover bg-center"
      style={{ backgroundImage: `url('/images/build2.jpg')` }} />
    

    <div className="mx-4 relative z-10 max-w-2xl mx-auto mt-10 p-4 overflow-hidden  rounded-2xl bg-gradient-to-b from-white/70 via-sky-900/70 to-blue-300/50 animate-gradient sm:p-12">

      <h1 className="text-2xl font-bold text-fuchsia-300 mb-6">Post a Job</h1>

      {/* Job Posting Form */}
      <form onSubmit={handleSubmit} className="flex flex-col gap-4 mb-8">
        <input
          type="text"
          placeholder="Job Title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="border focus:outline-none focus:ring-2 focus:ring-slate-700/50 p-2 rounded  text-white "
          required
        />
        <textarea
          placeholder="Job Description"
          value={description}
          autoComplete="off"
          onChange={(e) => setDescription(e.target.value)}
          className="border focus:outline-none focus:ring-2 focus:ring-slate-700/50 p-2 rounded  text-white "
          required
        />
        <input
          type="text"
          placeholder="Location"
          value={location}
          onChange={(e) => setLocation(e.target.value)}
          className="border focus:outline-none focus:ring-2 focus:ring-slate-700/50 p-2 rounded  text-white "
          required
        />

        
        <input
          type="text"
          placeholder="Salary"
          value={salary}
          onChange={handleSalaryChange}
          className="border focus:outline-none focus:ring-2 focus:ring-slate-700/50 p-2 rounded  text-white "
          required
        />

        <div className="grid grid-cols-2 gap-4">
            <select 
              value={jobType} 
              onChange={(e) => setJobType(e.target.value)}
              className="border focus:outline-none focus:ring-2 focus:ring-slate-700/50 p-3 rounded-xl bg-sky-800/50 text-white outline-none focus:border-fuchsia-500 transition-all cursor-pointer"
            >
              <option value="Full-Time">Full-Time</option>
              <option value="Part-Time">Part-Time</option>
              <option value="Contract">Contract</option>
              <option value="Freelance">Freelance</option>
            </select>

            <select 
              value={locationType} 
              onChange={(e) => setLocationType(e.target.value)}
              className="border p-3 rounded-xl bg-sky-800/50 text-white outline-none focus:border-fuchsia-500 transition-all cursor-pointer"
            >
              <option value="On-site">On-site</option>
              <option value="Remote">Remote</option>
              <option value="Hybrid">Hybrid</option>
            </select>
          </div>
        <input
          type="text"
          placeholder="Skills"
          value={skills}
          onChange={(e) => setSkills(e.target.value)}
          className="border focus:outline-none focus:ring-2 focus:ring-slate-700/50 p-2 rounded  text-white "
          required
        />
        <button
          type="submit"
          className="bg-blue-600 text-white p-2 rounded"
          disabled={loading}
        >
          Post Job
        </button>
      </form>

      {/* Jobs List */}
      <div>
        <h2 className="text-xl font-bold mb-4 text-sky-300">Your Previous Job Postings</h2>
        {jobs.length === 0 ? (
          <p>No jobs posted yet.</p>
        ) : (
          jobs.map((job) => (
            <div
              key={job.id}
              className="border p-4 rounded mb-4 bg-fuchsia-800/50 flex flex-col gap-2"
            >
            <div>
  <h2 className="text-2xl font-black text-white mb-2 drop-shadow-md uppercase tracking-tight">
    Job Title: {job.title}
  </h2>
  <p className="text-slate-200 text-sm mb-4 leading-relaxed line-clamp-2">
    Description: {job.description}
  </p>
  <div className="flex flex-wrap gap-2 my-2">
                      <span className="bg-fuchsia-500/20 text-fuchsia-300 text-[9px] px-2 py-1 rounded border border-fuchsia-500/30 font-black uppercase tracking-widest">
                        {job.job_type || 'Full-Time'}
                      </span>
                      <span className="bg-cyan-500/20 text-cyan-300 text-[9px] px-2 py-1 rounded border border-cyan-500/30 font-black uppercase tracking-widest">
                        {job.location_type || 'On-site'}
                      </span>
                      </div>
  <div className="flex flex-wrap gap-2 mb-4">
    <span className="bg-fuchsia-500/20 text-fuchsia-300 text-xs px-2 py-1 rounded border border-fuchsia-500/30 font-bold">
       ${Number(job.salary).toLocaleString()}
    </span>
    <span className="bg-cyan-500/20 text-cyan-300 text-xs px-2 py-1 rounded border border-cyan-500/30 font-bold">
       {job.location}
    </span>
    <p></p>
  </div>
</div>


              <div className="flex gap-2 mt-2">
                <button
                  onClick={() => handleDelete(job.id)}
                  className="bg-red-500 text-white px-2 py-1 rounded hover:bg-red-600"
                >
                  Delete
                </button>
                <button
                onClick={() => router.push('/messages')} 
                  className="bg-indigo-500 text-white px-2 py-1 rounded hover:bg-indigo-600"
                >
                  View Messages
                </button>
                <button
                onClick={() => router.push(`/edit_job/${job.id}`)}
                  className="bg-indigo-500 text-white px-2 py-1 rounded hover:bg-indigo-600"
                >
                  Edit
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Messages Modal */}
      {showMessages && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
          <div className="bg-white p-6 rounded max-w-lg w-full relative">
            <button
              onClick={() => setShowMessages(false)}
              className="absolute top-2 right-2 text-gray-600 hover:text-gray-900"
            >
              
            </button>
            <h3 className="text-lg font-bold mb-4">Job Messages</h3>
            {selectedJobMessages.length === 0 ? (
              <p>No messages yet.</p>
            ) : (
              selectedJobMessages.map((msg) => (
                <div key={msg.id} className="border p-2 rounded mb-2">
                  <p>
                    <span className="font-semibold">{msg.applicant_username}:</span>{" "}
                    {msg.message || "No message content"}
                  </p>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
    
      </main>
  );
}