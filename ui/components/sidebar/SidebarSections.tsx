import {Fragment} from 'react';
import type {ReactNode} from 'react';
import type {SidebarSection} from '../../types';

export type SidebarVariant = 'left' | 'right';

export function SidebarSections({
  renderSection,
  sections,
  variant,
}: {
  renderSection: (section: SidebarSection) => ReactNode;
  sections: SidebarSection[];
  variant: SidebarVariant;
}) {
  return (
    <>
      {sections.map((section, index) => (
        <Fragment key={section}>
          {index > 0 ? <div className={`${variant}-sidebar-section-separator`} role="separator" /> : null}
          {renderSection(section)}
        </Fragment>
      ))}
    </>
  );
}
