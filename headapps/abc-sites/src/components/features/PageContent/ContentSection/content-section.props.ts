import type { ContentSectionFields } from '@/components/foundation/content-section/content-section';
import type { CompatibleDatasource, PlaceholderComponentProps } from '@/lib/component-props';

export type { ContentSectionFields };

export interface ContentSectionProps extends PlaceholderComponentProps {
  fields?: CompatibleDatasource<ContentSectionFields>;
}
