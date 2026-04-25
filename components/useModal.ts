import { useState } from "react";
import { ModalConfig } from "./atom/Modal";

export function useModal(initialModals: ModalConfig[]) {
  const [modals, setModals] = useState<ModalConfig[]>(initialModals);

  const showModal = (key: string) => {
    setModals((prev) =>
      prev.map((modal) =>
        modal.key === key ? { ...modal, visible: true } : modal
      )
    );
  };

  const closeModal = (key: string) => {
    setModals((prev) =>
      prev.map((modal) =>
        modal.key === key ? { ...modal, visible: false } : modal
      )
    );
  };

  return { modals, showModal, closeModal };
}
