import PropTypes from 'prop-types'

/**
 * Componente Card para mostrar información en tarjetas
 * @param {Object} props - Propiedades del componente
 * @param {string} props.title - Título de la tarjeta
 * @param {React.ComponentType} props.icon - Icono a mostrar (componente de Heroicons)
 * @param {React.ReactNode} props.children - Contenido de la tarjeta
 * @param {string} props.className - Clases CSS adicionales
 * @param {string} props.ariaLabel - Etiqueta ARIA personalizada
 */
function Card({ 
  title, 
  icon: Icon, 
  children, 
  className = '',
  ariaLabel
}) {
  const cardId = `card-${title.toLowerCase().replace(/\s+/g, '-')}`
  
  return (
    <div 
      className={`card ${className}`}
      role="region"
      aria-labelledby={cardId}
      aria-label={ariaLabel}
    >
      <div className="flex items-center mb-4">
        {Icon && (
          <div 
            className="p-2 bg-primary-50 rounded-lg mr-3"
            aria-hidden="true"
          >
            <Icon className="h-6 w-6 text-primary-600" />
          </div>
        )}
        <h3 
          id={cardId}
          className="text-lg font-semibold text-gray-900"
        >
          {title}
        </h3>
      </div>
      <div 
        className="text-gray-600"
        role="contentinfo"
      >
        {children}
      </div>
    </div>
  )
}

Card.propTypes = {
  title: PropTypes.string.isRequired,
  icon: PropTypes.elementType,
  children: PropTypes.node.isRequired,
  className: PropTypes.string,
  ariaLabel: PropTypes.string
}

export default Card 