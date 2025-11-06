import { useState } from "react";
import { 
  User, 
  Bell, 
  Palette, 
  Shield, 
  Globe, 
  Video, 
  ChevronRight,
  Check
} from "lucide-react";
import useAuthUser from "../hooks/useAuthUser";
import toast from "react-hot-toast";

const SettingsPage = () => {
  const { authUser } = useAuthUser();
  const [activeSection, setActiveSection] = useState("account");

  // Theme options
  const themes = [
    "light", "dark", "cupcake", "bumblebee", "emerald", 
    "corporate", "synthwave", "retro", "cyberpunk", "valentine",
    "halloween", "garden", "forest", "aqua", "lofi",
    "pastel", "fantasy", "wireframe", "black", "luxury",
    "dracula", "cmyk", "autumn", "business", "acid",
    "lemonade", "night", "coffee", "winter", "dim",
    "nord", "sunset"
  ];

  const [currentTheme, setCurrentTheme] = useState(
    document.documentElement.getAttribute("data-theme") || "coffee"
  );

  const handleThemeChange = (theme) => {
    setCurrentTheme(theme);
    document.documentElement.setAttribute("data-theme", theme);
    localStorage.setItem("theme", theme);
    toast.success(`Theme changed to ${theme}`);
  };

  const sections = [
    { id: "account", label: "Account", icon: User },
    { id: "notifications", label: "Notifications", icon: Bell },
    { id: "appearance", label: "Appearance", icon: Palette },
    { id: "privacy", label: "Privacy & Security", icon: Shield },
    { id: "language", label: "Language", icon: Globe },
    { id: "calls", label: "Calls & Media", icon: Video },
  ];

  return (
    <div className="min-h-screen bg-base-200">
      <div className="max-w-6xl mx-auto p-6">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Settings</h1>
          <p className="text-base-content/60">Manage your account settings and preferences</p>
        </div>

        <div className="grid lg:grid-cols-4 gap-6">
          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="card bg-base-100 shadow-xl">
              <div className="card-body p-4">
                <nav className="space-y-1">
                  {sections.map((section) => {
                    const Icon = section.icon;
                    return (
                      <button
                        key={section.id}
                        onClick={() => setActiveSection(section.id)}
                        className={`btn btn-ghost justify-start w-full gap-3 ${
                          activeSection === section.id ? "btn-active" : ""
                        }`}
                      >
                        <Icon className="size-4" />
                        <span className="flex-1 text-left text-sm">{section.label}</span>
                        <ChevronRight className="size-4" />
                      </button>
                    );
                  })}
                </nav>
              </div>
            </div>
          </div>

          {/* Content */}
          <div className="lg:col-span-3">
            <div className="card bg-base-100 shadow-xl">
              <div className="card-body">
                {/* Account Section */}
                {activeSection === "account" && (
                  <div className="space-y-6">
                    <div>
                      <h2 className="text-2xl font-bold mb-4">Account Settings</h2>
                      <p className="text-base-content/60 mb-6">
                        Manage your personal information and account details
                      </p>
                    </div>

                    {/* Profile Info */}
                    <div className="flex items-center gap-4 p-4 bg-base-200 rounded-lg">
                      <div className="avatar">
                        <div className="w-20 rounded-full ring-4 ring-primary ring-offset-2 ring-offset-base-100">
                          <img src={authUser?.profilePic} alt={authUser?.fullName} />
                        </div>
                      </div>
                      <div className="flex-1">
                        <h3 className="font-bold text-lg">{authUser?.fullName}</h3>
                        <p className="text-base-content/60">{authUser?.email}</p>
                        <div className="flex gap-2 mt-2">
                          <span className="badge badge-primary">{authUser?.nativeLanguage}</span>
                          <span className="badge badge-secondary">Learning {authUser?.learningLanguage}</span>
                        </div>
                      </div>
                      <button className="btn btn-primary btn-sm">Edit Profile</button>
                    </div>

                    {/* Bio */}
                    <div className="form-control">
                      <label className="label">
                        <span className="label-text font-semibold">Bio</span>
                      </label>
                      <textarea
                        className="textarea textarea-bordered h-24"
                        placeholder="Tell us about yourself..."
                        defaultValue={authUser?.bio}
                      />
                    </div>

                    {/* Location */}
                    <div className="form-control">
                      <label className="label">
                        <span className="label-text font-semibold">Location</span>
                      </label>
                      <input
                        type="text"
                        className="input input-bordered"
                        defaultValue={authUser?.location}
                      />
                    </div>

                    <button className="btn btn-primary">Save Changes</button>
                  </div>
                )}

                {/* Notifications Section */}
                {activeSection === "notifications" && (
                  <div className="space-y-6">
                    <div>
                      <h2 className="text-2xl font-bold mb-4">Notification Preferences</h2>
                      <p className="text-base-content/60 mb-6">
                        Choose what notifications you want to receive
                      </p>
                    </div>

                    <div className="space-y-4">
                      {[
                        { label: "Message Notifications", desc: "Get notified when you receive new messages" },
                        { label: "Friend Requests", desc: "Get notified about new friend requests" },
                        { label: "Group Invites", desc: "Get notified when added to groups" },
                        { label: "Meeting Alerts", desc: "Get notified about upcoming meetings" },
                        { label: "Sound Effects", desc: "Play sound for notifications" },
                      ].map((item, idx) => (
                        <div key={idx} className="flex items-center justify-between p-4 bg-base-200 rounded-lg">
                          <div>
                            <p className="font-semibold">{item.label}</p>
                            <p className="text-sm text-base-content/60">{item.desc}</p>
                          </div>
                          <input type="checkbox" className="toggle toggle-primary" defaultChecked />
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Appearance Section */}
                {activeSection === "appearance" && (
                  <div className="space-y-6">
                    <div>
                      <h2 className="text-2xl font-bold mb-4">Appearance</h2>
                      <p className="text-base-content/60 mb-6">
                        Customize the look and feel of your app
                      </p>
                    </div>

                    <div>
                      <h3 className="font-semibold mb-3">Theme</h3>
                      <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-3">
                        {themes.map((theme) => (
                          <button
                            key={theme}
                            onClick={() => handleThemeChange(theme)}
                            className={`btn btn-sm capitalize ${
                              currentTheme === theme ? "btn-primary" : "btn-outline"
                            }`}
                            data-theme={theme}
                          >
                            {currentTheme === theme && <Check className="size-3 mr-1" />}
                            {theme}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="space-y-4">
                      <div className="flex items-center justify-between p-4 bg-base-200 rounded-lg">
                        <div>
                          <p className="font-semibold">Compact Mode</p>
                          <p className="text-sm text-base-content/60">Use smaller UI elements</p>
                        </div>
                        <input type="checkbox" className="toggle toggle-primary" />
                      </div>
                      <div className="flex items-center justify-between p-4 bg-base-200 rounded-lg">
                        <div>
                          <p className="font-semibold">Animations</p>
                          <p className="text-sm text-base-content/60">Enable UI animations</p>
                        </div>
                        <input type="checkbox" className="toggle toggle-primary" defaultChecked />
                      </div>
                    </div>
                  </div>
                )}

                {/* Privacy Section */}
                {activeSection === "privacy" && (
                  <div className="space-y-6">
                    <div>
                      <h2 className="text-2xl font-bold mb-4">Privacy & Security</h2>
                      <p className="text-base-content/60 mb-6">
                        Control your privacy and security settings
                      </p>
                    </div>

                    <div className="space-y-4">
                      <div className="flex items-center justify-between p-4 bg-base-200 rounded-lg">
                        <div>
                          <p className="font-semibold">Show Online Status</p>
                          <p className="text-sm text-base-content/60">Let others see when you're online</p>
                        </div>
                        <input type="checkbox" className="toggle toggle-primary" defaultChecked />
                      </div>
                      <div className="flex items-center justify-between p-4 bg-base-200 rounded-lg">
                        <div>
                          <p className="font-semibold">Read Receipts</p>
                          <p className="text-sm text-base-content/60">Show when you've read messages</p>
                        </div>
                        <input type="checkbox" className="toggle toggle-primary" defaultChecked />
                      </div>
                      <div className="flex items-center justify-between p-4 bg-base-200 rounded-lg">
                        <div>
                          <p className="font-semibold">Profile Visibility</p>
                          <p className="text-sm text-base-content/60">Who can see your profile</p>
                        </div>
                        <select className="select select-bordered select-sm">
                          <option>Everyone</option>
                          <option>Friends Only</option>
                          <option>Nobody</option>
                        </select>
                      </div>
                    </div>

                    <div className="divider"></div>

                    <div>
                      <h3 className="font-semibold mb-3">Blocked Users</h3>
                      <p className="text-sm text-base-content/60 mb-4">
                        You haven't blocked anyone yet
                      </p>
                      <button className="btn btn-outline btn-sm">Manage Blocked Users</button>
                    </div>
                  </div>
                )}

                {/* Language Section */}
                {activeSection === "language" && (
                  <div className="space-y-6">
                    <div>
                      <h2 className="text-2xl font-bold mb-4">Language Preferences</h2>
                      <p className="text-base-content/60 mb-6">
                        Manage your language learning preferences
                      </p>
                    </div>

                    <div className="grid md:grid-cols-2 gap-4">
                      <div className="form-control">
                        <label className="label">
                          <span className="label-text font-semibold">Native Language</span>
                        </label>
                        <select className="select select-bordered" defaultValue={authUser?.nativeLanguage}>
                          <option>English</option>
                          <option>Spanish</option>
                          <option>French</option>
                          <option>German</option>
                          <option>Hindi</option>
                          <option>Chinese</option>
                          <option>Japanese</option>
                          <option>Arabic</option>
                        </select>
                      </div>

                      <div className="form-control">
                        <label className="label">
                          <span className="label-text font-semibold">Learning Language</span>
                        </label>
                        <select className="select select-bordered" defaultValue={authUser?.learningLanguage}>
                          <option>English</option>
                          <option>Spanish</option>
                          <option>French</option>
                          <option>German</option>
                          <option>Hindi</option>
                          <option>Chinese</option>
                          <option>Japanese</option>
                          <option>Arabic</option>
                        </select>
                      </div>
                    </div>

                    <button className="btn btn-primary">Update Languages</button>
                  </div>
                )}

                {/* Calls Section */}
                {activeSection === "calls" && (
                  <div className="space-y-6">
                    <div>
                      <h2 className="text-2xl font-bold mb-4">Calls & Media</h2>
                      <p className="text-base-content/60 mb-6">
                        Manage call and media settings
                      </p>
                    </div>

                    <div className="space-y-4">
                      <div className="flex items-center justify-between p-4 bg-base-200 rounded-lg">
                        <div>
                          <p className="font-semibold">Auto-Answer Calls</p>
                          <p className="text-sm text-base-content/60">Automatically answer incoming calls</p>
                        </div>
                        <input type="checkbox" className="toggle toggle-primary" />
                      </div>
                      <div className="flex items-center justify-between p-4 bg-base-200 rounded-lg">
                        <div>
                          <p className="font-semibold">HD Video Quality</p>
                          <p className="text-sm text-base-content/60">Use higher quality video</p>
                        </div>
                        <input type="checkbox" className="toggle toggle-primary" defaultChecked />
                      </div>
                      <div className="flex items-center justify-between p-4 bg-base-200 rounded-lg">
                        <div>
                          <p className="font-semibold">Media Auto-Download</p>
                          <p className="text-sm text-base-content/60">Automatically download images</p>
                        </div>
                        <select className="select select-bordered select-sm">
                          <option>Always</option>
                          <option>Wi-Fi Only</option>
                          <option>Never</option>
                        </select>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SettingsPage;
