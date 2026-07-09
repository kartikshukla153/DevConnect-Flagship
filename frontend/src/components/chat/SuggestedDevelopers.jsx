import useSuggestedDevelopers from "../../hooks/useSuggestedDevelopers";
import SuggestedDeveloperCard from "./SuggestedDeveloperCard";

function SuggestedDevelopers({
  onConversationCreated,
}) {
  const developers = useSuggestedDevelopers();

  if (!developers.length) return null;

  return (
    <div className="space-y-3">

      <h2 className="font-bold text-lg">
        Suggested Developers
      </h2>

      {developers.map((developer) => (
        <SuggestedDeveloperCard
          key={developer._id}
          developer={developer}
          onConversationCreated={onConversationCreated}
        />
      ))}

    </div>
  );
}

export default SuggestedDevelopers;