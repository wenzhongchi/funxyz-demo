import axios from 'axios';

const client = axios.create();

const apiKey = import.meta.env.VITE_CRYPTOCOMPARE_API_KEY;

client.interceptors.request.use((config) => {
  config.headers['Authorization'] = `Bearer ${apiKey}`;
  return config;
});

export default client;
