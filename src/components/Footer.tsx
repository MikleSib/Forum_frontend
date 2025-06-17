import React from 'react';
import { Box, Container, Typography, Link, Divider, Grid } from '@mui/material';
import { styled } from '@mui/material/styles';
import EmailIcon from '@mui/icons-material/Email';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import BusinessIcon from '@mui/icons-material/Business';
import CopyrightIcon from '@mui/icons-material/Copyright';

const FooterContainer = styled('footer')(({ theme }) => ({
  backgroundColor: '#f8f9fa',
  color: theme.palette.text.primary,
  paddingTop: theme.spacing(4),
  paddingBottom: theme.spacing(3),
  marginTop: 'auto',
  boxShadow: '0 -4px 10px rgba(0, 0, 0, 0.05)',
  borderTop: '1px solid rgba(0, 0, 0, 0.09)',
  minHeight: 180,
}));

const FooterLink = styled(Link)(({ theme }) => ({
  color: theme.palette.primary.main,
  textDecoration: 'none',
  '&:hover': {
    textDecoration: 'underline',
  },
}));

const FooterItem = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  marginBottom: theme.spacing(1.5),
}));

const IconWrapper = styled(Box)(({ theme }) => ({
  marginRight: theme.spacing(1),
  color: theme.palette.primary.main,
  display: 'flex',
  alignItems: 'center',
}));

const FooterTitle = styled(Typography)(({ theme }) => ({
  fontWeight: 'bold', 
  color: theme.palette.text.primary,
  marginBottom: theme.spacing(2),
  position: 'relative',
  '&:after': {
    content: '""',
    position: 'absolute',
    bottom: -8,
    left: 0,
    width: 40,
    height: 3,
    backgroundColor: theme.palette.primary.main,
    borderRadius: 2,
  }
}));

const Footer: React.FC = () => {
  const currentYear = new Date().getFullYear();

  return (
    <FooterContainer>
      <Container maxWidth="lg">
        <Grid container spacing={3}>
          <Grid size={{xs: 12, md: 4}}>
            <FooterTitle variant="h6">
              Рыболовный форум
            </FooterTitle>
            <Typography variant="body2" sx={{ mb: 2, color: 'text.secondary' }}>
              Место встречи всех любителей рыбалки, где делятся опытом, советами и историями.
            </Typography>
          </Grid>
          
          <Grid size={{xs: 12, md: 4}}>
            <FooterTitle variant="h6">
              Контакты
            </FooterTitle>
            <FooterItem>
              <IconWrapper>
                <BusinessIcon fontSize="small" />
              </IconWrapper>
              <Typography variant="body2" color="text.secondary">
                ИП Трофимов Михаил Вячеславович
              </Typography>
            </FooterItem>
            <FooterItem>
              <IconWrapper>
                <LocationOnIcon fontSize="small" />
              </IconWrapper>
              <Typography variant="body2" color="text.secondary">
                г. Москва, ул. Тверская, д. 10, офис 512
              </Typography>
            </FooterItem>
            <FooterItem>
              <IconWrapper>
                <EmailIcon fontSize="small" />
              </IconWrapper>
              <FooterLink href="mailto:sales@рыболовный-форум.рф">
                sales@рыболовный-форум.рф
              </FooterLink>
            </FooterItem>
          </Grid>
          
          <Grid size={{xs: 12, md: 4}}>
            <FooterTitle variant="h6">
              Разделы
            </FooterTitle>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
              <FooterLink href="/forum" variant="body2">Форум</FooterLink>
              <FooterLink href="/news" variant="body2">Новости</FooterLink>
            </Box>
          </Grid>
        </Grid>
        
        <Divider sx={{ my: 3, borderColor: 'rgba(0,0,0,0.1)' }} />
        
        <Box sx={{ 
          display: 'flex',
          flexDirection: { xs: 'column', sm: 'row' },
          justifyContent: 'space-between',
          alignItems: { xs: 'center', sm: 'flex-start' },
          gap: 1
        }}>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <CopyrightIcon sx={{ mr: 0.5, fontSize: '1rem', color: 'text.secondary' }} />
            <Typography variant="body2" color="text.secondary">
              {currentYear} Рыболовный форум. Все права защищены.
            </Typography>
          </Box>
          
          <Box sx={{ display: 'flex', gap: 2 }}>
            <FooterLink href="/terms" variant="body2">Условия использования</FooterLink>
            <FooterLink href="/privacy" variant="body2">Политика конфиденциальности</FooterLink>
          </Box>
        </Box>
      </Container>
    </FooterContainer>
  );
};

export default Footer; 