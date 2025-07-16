import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import App from 'src/App';

describe('App Component', () => {
    // A P2P test is a "Pass to Pass test", which means it should pass without any issues both before and after implementation.
    it('Renders the Vite Logo in a link', () => {
        render(<App />);
        const link = screen.getByRole('link', { name: /vite logo/i });

        expect(link).toBeInTheDocument();
        expect(link).toHaveAttribute('href', 'https://vitejs.dev');
        expect(link).toHaveAttribute('target', '_blank');

        expect(link.children.length).toBe(1);

        const firstChild = link.children[0]!;
        expect(firstChild.tagName).toBe('IMG');
        expect(firstChild).toHaveAttribute('src', '/vite.svg');
        expect(firstChild).toHaveAttribute('alt', 'Vite logo');
    });

    it('Renders the React Logo in a link', () => {
        render(<App />);
        const link = screen.getByRole('link', { name: /react logo/i });

        expect(link).toBeInTheDocument();
        expect(link).toHaveAttribute('href', 'https://react.dev');
        expect(link).toHaveAttribute('target', '_blank');

        expect(link.children.length).toBe(1);

        const firstChild = link.children[0]!;
        expect(firstChild.tagName).toBe('IMG');
        expect(firstChild).toHaveAttribute('src', '/src/assets/react.svg');
        expect(firstChild).toHaveAttribute('alt', 'React logo');
    });

    it('Renders the header with "Vite + React"', async () => {
        render(<App />);
        const header = screen.getByRole('heading', { name: /vite \+ react/i });

        expect(header).toBeInTheDocument();
    });

    it('Renders a button that increments count in a card', async () => {
        render(<App />);
        const button = screen.getByRole('button', { name: /count is 0/i });

        expect(button).toBeInTheDocument();
        expect(button).toHaveTextContent('count is 0');

        // Expect the button to be inside a card
        const card = button.parentElement!;
        expect(card).toHaveClass('card');
        expect(card.tagName).toBe('DIV');

        // Simulate a click to increment the count
        await userEvent.click(button);

        expect(button).toHaveTextContent('count is 1');
    });
});