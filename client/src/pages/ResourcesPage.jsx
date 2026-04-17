import React, { useEffect, useState } from 'react';
import { resourceService } from 'services/api';
import Card from 'components/ui/Card';
import { Badge, Spinner, EmptyState } from 'components/ui/index';
import styles from './ResourcesPage.module.css';

const TAB_TYPES = [
  { value: '', label: '⚡ All', count: 0 },
  { value: 'tip', label: '💡 Tips' },
  { value: 'question', label: '❓ Questions' },
  { value: 'video', label: '🎥 Videos' },
  { value: 'article', label: '📰 Articles' },
  { value: 'guide', label: '📖 Guides' },
];

const CategoryColors = {
  hr: { bg: '#F3E8FF', color: '#7C3AED' },
  technical: { bg: '#DBEAFE', color: '#1D4ED8' },
  behavioral: { bg: '#DCFCE7', color: '#15803D' },
  general: { bg: '#F3F4F6', color: '#374151' },
  salary: { bg: '#FEF9C3', color: '#92400E' },
  company: { bg: '#FEE2E2', color: '#B91C1C' },
};

const ResourceCard = ({ resource }) => {
  const [expanded, setExpanded] = useState(false);
  const catStyle = CategoryColors[resource.category] || CategoryColors.general;

  return (
    <Card hover className={styles.resourceCard}>
      <div className={styles.rcHeader}>
        <div className={styles.rcMeta}>
          <Badge bg={catStyle.bg} color={catStyle.color}>{resource.category}</Badge>
          {resource.isFeatured && <Badge bg="#FEF9C3" color="#92400E">⭐ Featured</Badge>}
        </div>
        <h3 className={styles.rcTitle}>{resource.title}</h3>
        <p className={styles.rcDesc}>{resource.description}</p>
      </div>

      {resource.content && (
        <div>
          {expanded ? (
            <div className={styles.rcContent}>
              {resource.content.split('\n').map((line, i) => (
                <p key={i} className={line.startsWith('**') ? styles.rcHeading : styles.rcPara}>
                  {line.replace(/\*\*/g, '')}
                </p>
              ))}
            </div>
          ) : null}
          <button
            className={styles.expandBtn}
            onClick={() => setExpanded(!expanded)}
          >
            {expanded ? '▲ Show less' : '▼ Read more'}
          </button>
        </div>
      )}

      {resource.url && (
        <a
          href={resource.url}
          target="_blank"
          rel="noopener noreferrer"
          className={styles.resourceLink}
        >
          🔗 Watch Video →
        </a>
      )}

      <div className={styles.rcFooter}>
        {resource.tags?.map(tag => (
          <span key={tag} className={styles.tag}>#{tag}</span>
        ))}
      </div>
    </Card>
  );
};

const ResourcesPage = () => {
  const [grouped, setGrouped] = useState({});
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('');

  useEffect(() => {
    const load = async () => {
      try {
        const { data } = await resourceService.getAll();
        setGrouped(data.grouped);
      } catch {
        // silent
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const visibleResources = () => {
    if (!activeTab) {
      return Object.values(grouped).flat();
    }
    return grouped[`${activeTab}s`] || grouped[activeTab] || [];
  };

  const resources = visibleResources();

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <h1 className={styles.title}>Learning Resources</h1>
        <p className={styles.subtitle}>Tips, question banks, videos and guides to help you ace your interviews</p>
      </div>

      {/* ── Tabs ── */}
      <div className={styles.tabs}>
        {TAB_TYPES.map((t) => (
          <button
            key={t.value}
            className={`${styles.tab} ${activeTab === t.value ? styles.tabActive : ''}`}
            onClick={() => setActiveTab(t.value)}
          >
            {t.label}
          </button>
        ))}
      </div>

      {loading ? (
        <div className={styles.loadingWrap}><Spinner size={40} /></div>
      ) : resources.length === 0 ? (
        <EmptyState icon="📚" title="No resources found" description="Resources will appear here once added." />
      ) : (
        <div className={styles.grid}>
          {resources.map((r) => (
            <ResourceCard key={r._id} resource={r} />
          ))}
        </div>
      )}
    </div>
  );
};

export default ResourcesPage;
