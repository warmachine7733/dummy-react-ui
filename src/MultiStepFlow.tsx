import React, { FormEvent, ReactNode, useEffect, useState } from "react";
import { Link, Navigate, Route, Routes, useNavigate } from "react-router-dom";
import { Address, flowApi, Preference, Profile } from "./flowApi";
import "./MultiStepFlow.css";

type RequestStatus = "loading" | "success" | "error";

interface StatusMessageProps {
  status: RequestStatus;
  successMessage: string;
  error?: string;
}

const errorMessage = (error: unknown) =>
  error instanceof Error ? error.message : "An unexpected error occurred";

const StatusMessage = ({ status, successMessage, error }: StatusMessageProps) => {
  if (status === "loading") {
    return <div className="flow-status loading">Loading...</div>;
  }

  if (status === "error") {
    return <div className="flow-status error-message">Error: {error}</div>;
  }

  return <div className="flow-status flow-success">{successMessage}</div>;
};

interface FlowPageProps {
  step: number;
  title: string;
  children: ReactNode;
}

const FlowPage = ({ step, title, children }: FlowPageProps) => (
  <main className="container flow-container">
    <div className="flow-heading">
      <Link className="flow-home-link" to="/">Back to API Demo</Link>
      <span className="step-indicator">Step {step} of 5</span>
    </div>
    <div className="step-track" aria-hidden="true">
      <div className="step-progress" style={{ width: `${step * 20}%` }} />
    </div>
    <h1 className="flow-title">{title}</h1>
    {children}
  </main>
);

const ProfileStep = () => {
  const navigate = useNavigate();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [status, setStatus] = useState<RequestStatus>("loading");
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;
    flowApi.getProfile().then((data) => {
      if (active) {
        setProfile(data);
        setStatus("success");
      }
    }).catch((requestError: unknown) => {
      if (active) {
        setError(errorMessage(requestError));
        setStatus("error");
      }
    });
    return () => { active = false; };
  }, []);

  return (
    <FlowPage step={1} title="Profile">
      <StatusMessage status={status} successMessage="Profile loaded." error={error} />
      {profile && (
        <dl className="flow-summary">
          <dt>Name</dt><dd>{profile.name}</dd>
          <dt>Email</dt><dd>{profile.email}</dd>
          <dt>Phone</dt><dd>{profile.phone}</dd>
        </dl>
      )}
      <div className="flow-actions flow-actions-end">
        <button className="btn btn-get" disabled={!profile} onClick={() => navigate("/flow/address")}>
          Continue
        </button>
      </div>
    </FlowPage>
  );
};

interface AddressStepProps {
  address: Address;
  setAddress: React.Dispatch<React.SetStateAction<Address>>;
}

const AddressStep = ({ address, setAddress }: AddressStepProps) => {
  const navigate = useNavigate();
  const [status, setStatus] = useState<RequestStatus>("loading");
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;
    flowApi.getAddress().then((data) => {
      if (active) {
        setAddress(data);
        setStatus("success");
      }
    }).catch((requestError: unknown) => {
      if (active) {
        setError(errorMessage(requestError));
        setStatus("error");
      }
    });
    return () => { active = false; };
  }, [setAddress]);

  const updateField = (field: keyof Address, value: string) => {
    setAddress((current) => ({ ...current, [field]: value }));
  };

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    setStatus("loading");
    try {
      await flowApi.updateAddress(address);
      setStatus("success");
      navigate("/flow/preferences");
    } catch (requestError: unknown) {
      setError(errorMessage(requestError));
      setStatus("error");
    }
  };

  return (
    <FlowPage step={2} title="Address">
      <StatusMessage status={status} successMessage="Address loaded and ready to edit." error={error} />
      <form onSubmit={submit} className="flow-form">
        <label>Street<input value={address.street} onChange={(event) => updateField("street", event.target.value)} required /></label>
        <label>Suite<input value={address.suite} onChange={(event) => updateField("suite", event.target.value)} required /></label>
        <label>City<input value={address.city} onChange={(event) => updateField("city", event.target.value)} required /></label>
        <label>Zip code<input value={address.zipcode} onChange={(event) => updateField("zipcode", event.target.value)} required /></label>
        <div className="flow-actions">
          <button type="button" className="btn flow-back" onClick={() => navigate("/flow/profile")}>Back</button>
          <button type="submit" className="btn btn-put" disabled={status === "loading"}>Continue</button>
        </div>
      </form>
    </FlowPage>
  );
};

interface PreferencesStepProps {
  selectedPreference: Preference | null;
  setSelectedPreference: React.Dispatch<React.SetStateAction<Preference | null>>;
}

const PreferencesStep = ({ selectedPreference, setSelectedPreference }: PreferencesStepProps) => {
  const navigate = useNavigate();
  const [preferences, setPreferences] = useState<Preference[]>([]);
  const [status, setStatus] = useState<RequestStatus>("loading");
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;
    flowApi.getPreferences().then((data) => {
      if (active) {
        setPreferences(data);
        setSelectedPreference((current) => current || data[0] || null);
        setStatus("success");
      }
    }).catch((requestError: unknown) => {
      if (active) {
        setError(errorMessage(requestError));
        setStatus("error");
      }
    });
    return () => { active = false; };
  }, [setSelectedPreference]);

  const submit = async () => {
    if (!selectedPreference) return;
    setStatus("loading");
    try {
      await flowApi.updatePreference(selectedPreference);
      setStatus("success");
      navigate("/flow/review");
    } catch (requestError: unknown) {
      setError(errorMessage(requestError));
      setStatus("error");
    }
  };

  return (
    <FlowPage step={3} title="Preferences">
      <StatusMessage status={status} successMessage="Preferences loaded." error={error} />
      <fieldset className="preference-list" disabled={status === "loading"}>
        <legend>Choose a notification preference</legend>
        {preferences.map((preference) => (
          <label key={preference.id}>
            <input
              type="radio"
              name="preference"
              checked={selectedPreference?.id === preference.id}
              onChange={() => setSelectedPreference(preference)}
            />
            {preference.title}
          </label>
        ))}
      </fieldset>
      <div className="flow-actions">
        <button className="btn flow-back" onClick={() => navigate("/flow/address")}>Back</button>
        <button className="btn btn-post" disabled={!selectedPreference || status === "loading"} onClick={submit}>Continue</button>
      </div>
    </FlowPage>
  );
};

interface ReviewData {
  profile: Profile;
  address: Address;
  preference: Preference;
}

const ReviewStep = () => {
  const navigate = useNavigate();
  const [review, setReview] = useState<ReviewData | null>(null);
  const [status, setStatus] = useState<RequestStatus>("loading");
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;
    Promise.all([
      flowApi.getReviewProfile(),
      flowApi.getReviewAddress(),
      flowApi.getReviewPreference(),
    ]).then(([profile, address, preference]) => {
      if (active) {
        setReview({ profile, address, preference });
        setStatus("success");
      }
    }).catch((requestError: unknown) => {
      if (active) {
        setError(errorMessage(requestError));
        setStatus("error");
      }
    });
    return () => { active = false; };
  }, []);

  return (
    <FlowPage step={4} title="Review">
      <StatusMessage status={status} successMessage="Profile, address, and preferences loaded." error={error} />
      {review && (
        <div className="review-grid">
          <section><h2>Profile</h2><p>{review.profile.name}</p><p>{review.profile.email}</p></section>
          <section><h2>Address</h2><p>{review.address.street}, {review.address.suite}</p><p>{review.address.city} {review.address.zipcode}</p></section>
          <section><h2>Preference</h2><p>{review.preference.title}</p></section>
        </div>
      )}
      <div className="flow-actions">
        <button className="btn flow-back" onClick={() => navigate("/flow/preferences")}>Back</button>
        <button className="btn btn-get" disabled={!review} onClick={() => navigate("/flow/complete")}>Submit</button>
      </div>
    </FlowPage>
  );
};

const CompleteStep = () => {
  const navigate = useNavigate();
  const [status, setStatus] = useState<RequestStatus>("loading");
  const [completionId, setCompletionId] = useState<number | null>(null);
  const [finalStatus, setFinalStatus] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;
    const finishFlow = async () => {
      try {
        const completion = await flowApi.complete();
        const result = await flowApi.getStatus();
        if (active) {
          setCompletionId(completion.id);
          setFinalStatus(result.completed ? "Complete" : "Submitted");
          setStatus("success");
        }
      } catch (requestError: unknown) {
        if (active) {
          setError(errorMessage(requestError));
          setStatus("error");
        }
      }
    };
    finishFlow();
    return () => { active = false; };
  }, []);

  return (
    <FlowPage step={5} title="Complete">
      <StatusMessage status={status} successMessage="Flow submitted successfully." error={error} />
      {completionId !== null && (
        <div className="completion-message">
          <h2>Journey complete</h2>
          <p>Submission ID: {completionId}</p>
          <p>Final status: {finalStatus}</p>
        </div>
      )}
      <div className="flow-actions">
        <button className="btn flow-back" onClick={() => navigate("/flow/review")}>Back</button>
        <button className="btn btn-get" onClick={() => navigate("/")}>Return to API Demo</button>
      </div>
    </FlowPage>
  );
};

const emptyAddress: Address = { street: "", suite: "", city: "", zipcode: "" };

const MultiStepFlow = () => {
  const [address, setAddress] = useState<Address>(emptyAddress);
  const [selectedPreference, setSelectedPreference] = useState<Preference | null>(null);

  return (
    <Routes>
      <Route path="profile" element={<ProfileStep />} />
      <Route path="address" element={<AddressStep address={address} setAddress={setAddress} />} />
      <Route path="preferences" element={<PreferencesStep selectedPreference={selectedPreference} setSelectedPreference={setSelectedPreference} />} />
      <Route path="review" element={<ReviewStep />} />
      <Route path="complete" element={<CompleteStep />} />
      <Route path="*" element={<Navigate to="profile" replace />} />
    </Routes>
  );
};

export default MultiStepFlow;