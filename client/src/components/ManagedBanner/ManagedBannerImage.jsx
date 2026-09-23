import './ManagedBannerImage.css'

export default function ManagedBannerImage({ src, alt = 'LAB NIVO promotional banner' }) {
  return <div className="managed-banner-image"><img src={src} alt={alt} /></div>
}
