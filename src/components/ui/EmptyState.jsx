import React from "react";
import Icon from "./Icon";
import "../../estilos/EmptyState.css";

const EmptyState = ({ title, description, actionLabel, onAction }) => (
  <div className="empty-state" role="status">
    <span className="empty-state__icon" aria-hidden="true">
      <Icon name="search" size={40} strokeWidth={1.5} />
    </span>
    <h3 className="empty-state__title">{title}</h3>
    {description && <p className="empty-state__description">{description}</p>}
    {actionLabel && onAction && (
      <button type="button" className="empty-state__action" onClick={onAction}>
        {actionLabel}
      </button>
    )}
  </div>
);

export default EmptyState;
