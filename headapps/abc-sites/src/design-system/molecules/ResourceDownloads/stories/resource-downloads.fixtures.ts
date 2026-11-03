import type {
  ResourceDownloadsDatasource,
  ResourceDownloadsFields,
} from '../resource-downloads.props';

export const downloadItems = [
  {
    id: 'english',
    label: { jsonValue: { value: 'Heart health guide (English)' } },
    file: {
      jsonValue: {
        value: {
          href: '/story-assets/resource-downloads.pdf',
          text: 'English PDF',
          linktype: 'media',
        },
      },
    },
    filename: { jsonValue: { value: 'heart-health-guide.pdf' } },
  },
  {
    id: 'spanish',
    label: { jsonValue: { value: 'Heart health guide (Spanish)' } },
    file: {
      jsonValue: {
        value: {
          href: '/story-assets/resource-downloads.pdf?language=es',
          text: 'Spanish PDF',
          linktype: 'media',
        },
      },
    },
    filename: { jsonValue: { value: 'guia-de-salud-del-corazon.pdf' } },
  },
] satisfies NonNullable<ResourceDownloadsDatasource['downloads']>;

export const singleDownloadDatasource: ResourceDownloadsDatasource = {
  title: { jsonValue: { value: 'The downloadable file label goes here' } },
  description: {
    jsonValue: {
      value:
        'Lorem ipsum dolor sit amet consectetur. Tristique vitae semper aliquet amet blandit et arcu.',
    },
  },
  ctaLabel: { jsonValue: { value: 'Download PDF' } },
  ctaAriaLabel: { jsonValue: { value: 'Download the heart health guide PDF' } },
  navigationLabel: { jsonValue: { value: 'Available heart health PDFs' } },
  downloads: { results: [downloadItems[0]] },
};

export function resourceDownloadsFields(
  overrides: Partial<ResourceDownloadsDatasource> = {}
): ResourceDownloadsFields {
  return { data: { datasource: { ...singleDownloadDatasource, ...overrides } } };
}
