import React from 'react';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import Hotel from '../components/Hotel'; // adjust to your path
import { MemoryRouter } from 'react-router-dom';
import axios from 'axios';

// Mock Axios
jest.mock('axios');
const mockedAxios = axios as jest.Mocked<typeof axios>;

describe('Hotel component', () => {
  const mockHotels = [
    {
      id: 1,
      title: 'Hotel Azure',
      imageurl: '/api/v1/images/sample.jpg',
      links: {
        likes: '/likes/1',
        fav: '/fav/1',
        msg: '/msg/1',
      },
    },
  ];

  beforeEach(() => {
    mockedAxios.get.mockResolvedValueOnce({ data: mockHotels });
  });

  it('renders hotels after loading', async () => {
    render(
      <MemoryRouter>
        <Hotel />
      </MemoryRouter>
    );

    expect(screen.getByRole('img')).toBeInTheDocument(); // Ant Design loading spinner

    await waitFor(() => {
      expect(screen.getByText(/Hotel Azure/i)).toBeInTheDocument();
    });

    expect(screen.getByRole('button', { name: /Search/i })).toBeInTheDocument();
  });

  it('filters hotels based on search input', async () => {
    render(
      <MemoryRouter>
        <Hotel />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText(/Hotel Azure/i)).toBeInTheDocument();
    });

    fireEvent.change(screen.getByPlaceholderText(/search/i), {
      target: { value: 'nonexistent' },
    });

    await waitFor(() => {
      expect(screen.queryByText(/Hotel Azure/i)).toBeNull();
    });
  });
});
