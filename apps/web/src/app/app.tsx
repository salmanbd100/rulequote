import { Box, Container, Heading, Link } from '@chakra-ui/react';
import { Outlet, Link as RouterLink } from 'react-router-dom';

export function App() {
  return (
    <Box minH="100vh" bg="gray.50">
      <Box bg="white" borderBottom="1px" borderColor="gray.200" py={4}>
        <Container maxW="container.xl">
          <Heading size="lg">
            <Link as={RouterLink} to="/" _hover={{ textDecoration: 'none' }}>
              RuleQuote
            </Link>
          </Heading>
        </Container>
      </Box>
      <Container maxW="container.xl" py={8}>
        <Outlet />
      </Container>
    </Box>
  );
}

export default App;
