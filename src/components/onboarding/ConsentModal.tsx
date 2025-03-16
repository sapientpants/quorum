import { useState } from "react";

interface ConsentModalProps {
  onCancel: () => void;
  onContinue: () => void;
}

function ConsentModal({ onCancel, onContinue }: ConsentModalProps) {
  const [storageOption, setStorageOption] = useState<
    "local" | "session" | "none"
  >("local");
  const [isConfirmed, setIsConfirmed] = useState(false);

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white p-8 rounded-lg shadow-lg max-w-md w-full">
        <h2 className="text-2xl font-bold mb-4">API Keys & Privacy Notice</h2>
        <p className="text-gray-700 mb-4">
          Please review our privacy policies regarding API key storage. Choose
          your preferred storage option:
        </p>
        <div className="mb-4">
          <p className="font-semibold mb-2">Storage Preference:</p>
          <div className="flex flex-col space-y-2">
            <label className="inline-flex items-center">
              <input
                type="radio"
                name="storage"
                value="local"
                checked={storageOption === "local"}
                onChange={() => setStorageOption("local")}
                className="form-radio"
              />
              <span className="ml-2">Local Storage</span>
            </label>
            <label className="inline-flex items-center">
              <input
                type="radio"
                name="storage"
                value="session"
                checked={storageOption === "session"}
                onChange={() => setStorageOption("session")}
                className="form-radio"
              />
              <span className="ml-2">Session Storage</span>
            </label>
            <label className="inline-flex items-center">
              <input
                type="radio"
                name="storage"
                value="none"
                checked={storageOption === "none"}
                onChange={() => setStorageOption("none")}
                className="form-radio"
              />
              <span className="ml-2">No Storage</span>
            </label>
          </div>
        </div>
        <div className="mb-6">
          <label className="inline-flex items-center">
            <input
              type="checkbox"
              checked={isConfirmed}
              onChange={() => setIsConfirmed(!isConfirmed)}
              className="form-checkbox"
            />
            <span className="ml-2">
              I acknowledge and agree to the privacy policy.
            </span>
          </label>
        </div>
        <div className="flex justify-end space-x-4">
          <button
            onClick={onCancel}
            className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400"
          >
            Cancel
          </button>
          <button
            onClick={onContinue}
            disabled={!isConfirmed}
            className={`px-4 py-2 rounded text-white ${isConfirmed ? "bg-gradient-to-r from-blue-500 to-green-500 hover:from-blue-600 hover:to-green-600" : "bg-gray-400 cursor-not-allowed"}`}
          >
            Continue
          </button>
        </div>
      </div>
    </div>
  );
}

export default ConsentModal;
