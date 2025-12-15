import { useRatingModal } from "../hooks/useRatingModal";
import RatingModal from "../components/ui/RatingModal";

/**
 * Global Rating Modal Wrapper
 * Listens for rating requests via socket and displays modal
 */
function RatingModalWrapper() {
  const { isRatingModalOpen, ratingData, closeRatingModal } = useRatingModal();

  return (
    <RatingModal
      isOpen={isRatingModalOpen}
      rideData={ratingData}
      onSubmit={closeRatingModal}
    />
  );
}

export default RatingModalWrapper;
