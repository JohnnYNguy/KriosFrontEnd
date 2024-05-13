import React from 'react';
import '../stylesheets/modalAlert.css'; 
import { IcustomAlertModal } from '../interface/IcustomAlertModal';



const BoundsAlert: React.FC<IcustomAlertModal> = ({ message, isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="customAlertOverlay">
      <div className="customAlert">
        <p>{message}</p>
        <button onClick={onClose}>Lukk</button>
      </div>
    </div>
  );
};

export default BoundsAlert;
