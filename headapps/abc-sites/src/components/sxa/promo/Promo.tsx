import React, { JSX } from 'react';
import {
  NextImage as ContentSdkImage,
  RichText as ContentSdkRichText,
} from '@sitecore-content-sdk/nextjs';
import { CompatibleLink } from 'components/content-sdk/CompatibleLink';
import { getFieldValue } from 'lib/component-props';
import { PromoContentProps, PromoFields as Fields, PromoProps } from './promo.props';

const PromoWrapper = ({
  styles,
  id,
  children,
}: {
  styles?: string;
  id?: string;
  children: JSX.Element;
}): JSX.Element => (
  <div className={`component promo ${styles}`} id={id}>
    <div className="component-content">{children}</div>
  </div>
);

const PromoContent = (props: PromoContentProps): JSX.Element => {
  const { fields, params, renderText } = props;
  const { styles, RenderingIdentifier: id } = params;

  if (!fields) {
    return (
      <PromoWrapper styles={styles} id={id}>
        <span className="is-empty-hint">Promo</span>
      </PromoWrapper>
    );
  }

  return (
    <PromoWrapper styles={styles} id={id}>
      <>
        <figure className="field-promoicon">
          <ContentSdkImage field={getFieldValue(fields.PromoIcon)} />
        </figure>
        <div className="promo-text">{renderText(fields)}</div>
      </>
    </PromoWrapper>
  );
};

export const Default = (props: PromoProps): JSX.Element => {
  const renderText = (fields: Fields) => {
    const promoTextField = getFieldValue(fields.PromoText);
    const promoLinkField = getFieldValue(fields.PromoLink);

    return (
      <>
        <div className="field-promotext">
          <ContentSdkRichText field={promoTextField} />
        </div>
        <div className="field-promolink">
          {promoLinkField ? <CompatibleLink field={promoLinkField} /> : null}
        </div>
      </>
    );
  };

  return <PromoContent {...props} renderText={renderText} />;
};

export const WithText = (props: PromoProps): JSX.Element => {
  const renderText = (fields: Fields) => (
    <>
      <div className="field-promotext">
        <ContentSdkRichText className="promo-text" field={getFieldValue(fields.PromoText)} />
      </div>
      <div className="field-promotext">
        <ContentSdkRichText className="promo-text" field={getFieldValue(fields.PromoText2)} />
      </div>
    </>
  );

  return <PromoContent {...props} renderText={renderText} />;
};
