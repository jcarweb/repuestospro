import React from 'react';
import LocationBasedSearch from '../components/LocationBasedSearch';
import Layout from '../components/Layout';

const NearbyProducts: React.FC = () => {
  return (
    <Layout>
      <LocationBasedSearch />
    </Layout>
  );
};

export default NearbyProducts;
