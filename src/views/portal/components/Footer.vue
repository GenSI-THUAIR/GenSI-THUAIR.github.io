<template>
  <!-- 页脚 -->
  <footer class="footer">
    <div class="container">
      <div class="footer-content">
        <!-- Logo Section -->
        <div class="footer-logo-section">
          <div class="footer-logo" @click="navigateTo('/portal_home', $event)">
            <img src="../assests/home/logo.png" alt="GenSI Logo" class="footer-logo-icon" />
          </div>
        </div>

        <!-- Menu Section -->
        <div class="footer-menu-section">
          <h4 class="footer-title">{{ $t('portal.footer.menu') }}</h4>
          <div class="menu-columns">
            <div class="menu-column">
              <a href="#" class="menu-link" @click="navigateTo('/portal/about', $event)">{{ $t('portal.nav.about')
                }}</a>
              <a href="#" class="menu-link" @click="toProjects($event)">{{ $t('portal.footer.projects') }}</a>
              <a href="#" class="menu-link" @click="navigateTo('/portal/news', $event)">{{ $t('portal.nav.news') }}</a>
              <a href="#" class="menu-link" @click="toPublications($event)">{{ $t('portal.footer.publications') }}</a>
            </div>
            <div class="menu-column">
              <a href="#" class="menu-link" @click="navigateTo('/portal/blog', $event)">{{ $t('portal.nav.blog') }}</a>
              <a href="#" class="menu-link" @click="navigateTo('/portal/posts', $event)">{{ $t('portal.nav.posts')
              }}</a>
              <a href="#" class="menu-link" @click="toSia($event)">{{ $t('portal.nav.siaLab') }}</a>
              <a href="#" class="menu-link" @click="navigateTo('/portal/contact', $event)">{{ $t('portal.nav.contact')
                }}</a>
            </div>
          </div>
        </div>

        <!-- Contact Section -->
        <div class="footer-contact-section">
          <div class="contact-info">
            <p class="footer-address">
              {{ $t('portal.footer.detailAddress') }}<br />
              {{ $t('portal.footer.address') }}<br />
              {{ $t('portal.footer.areaAddress') }}
            </p>
            <div class="social-links">
              <div class="social-icon" @click="toNewTab('https://github.com/GenSI-THUAIR')">
                <img src="../assests/home/github.png" alt="GitHub" />
              </div>
              <div class="social-icon" @click="toNewTab('https://huggingface.co/GenSI')">
                <img src="../assests/home/huggingface.png" alt="Hugging Face" />
              </div>
              <div class="social-icon" @click="toNewTab('https://x.com/hello_gensi')">
                <img src="../assests/home/x.png" alt="X" />
              </div>
              <div class="social-icon" @click="toNewTab('https://www.youtube.com/@hello_gensi')">
                <img src="../assests/home/youtube.png" alt="youtube" />
              </div>
              <div class="social-icon"
                @click="toNewTab('https://www.xiaohongshu.com/user/profile/65465f81000000000301f9bd')">
                <img src="../assests/home/rn_black.png" alt="小红书" />
              </div>
              <div class="social-icon wx-icon" ref="wxIconRef" :class="{ active: wxQrcodeVisible }"
                @click.stop="toggleWxQrcode">
                <img src="../assests/home/wx_black.png" alt="微信" />
                <div class="wx-qrcode">
                  <img src="../assests/img/wxqrcode.jpg" alt="微信二维码" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </footer>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue';
import { useRouter } from 'vue-router';
import { $t } from '@/locales';

const router = useRouter();

// 内部路由跳转
function navigateTo(path: string, event?: Event) {
  if (event) {
    event.preventDefault(); // 阻止默认行为
  }
  router.push(path);
}

// 跳转到 About 页面的 Contact 部分
function navigateToContact(event?: Event) {
  if (event) {
    event.preventDefault(); // 阻止默认行为
  }
  router.push('/portal/about').then(() => {
    // 使用 setTimeout 确保页面已经渲染完成
    setTimeout(() => {
      const contactElement = document.getElementById('contact');
      if (contactElement) {
        contactElement.scrollIntoView({ behavior: 'smooth' });
      }
    }, 100);
  });
}

// 跳转到 SIA-Lab
function toSia(event?: Event) {
  if (event) {
    event.preventDefault();
  }
  window.open('https://github.com/BytedTsinghua-SIA', '_blank');
}

// 跳转到 research 页面的 Projects 部分
function toProjects(event?: Event) {
  if (event) {
    event.preventDefault();
  }
  router.push('/portal/project');
}

// 跳转到 research 页面的 Publications 部分
function toPublications(event?: Event) {
  if (event) {
    event.preventDefault();
  }
  router.push({ path: '/portal/publications', });
}

// 外部链接跳转
function toNewTab(url: string) {
  window.open(url, '_blank');
}

// 移动端“微信二维码”点击展开/收起（桌面端仍保留 hover 行为）
const wxQrcodeVisible = ref(false);
const wxIconRef = ref<HTMLElement | null>(null);

function toggleWxQrcode() {
  // 仅在较小屏幕下启用点击切换，桌面端以 hover 为主
  if (typeof window !== 'undefined' && window.innerWidth <= 1024) {
    wxQrcodeVisible.value = !wxQrcodeVisible.value;
  }
}

function handleClickOutside(event: MouseEvent) {
  if (!wxQrcodeVisible.value) return;
  const target = event.target as Node | null;
  if (wxIconRef.value && target && !wxIconRef.value.contains(target)) {
    wxQrcodeVisible.value = false;
  }
}

onMounted(() => {
  document.addEventListener('click', handleClickOutside);
});

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside);
});
</script>

<style scoped>
/* 页脚 */
.footer {
  color: #000;
  padding: 80px 0;
  background-image: url('../assests/home/footerbg.png');
  background-repeat: no-repeat;
  background-size: 100% 100%;
}

.container {
  margin: 0 auto;
  padding: 0 40px;
}

.footer-content {
  display: grid;
  grid-template-columns: 1fr 1fr 1fr;
  gap: 120px;
  align-items: start;
}

.footer-logo-section {
  display: flex;
  align-items: center;
  justify-content: center;
  align-self: center;
}

.footer-logo {
  display: flex;
  align-items: center;
  gap: 16px;
}

.footer-logo-icon {
  height: 80px;
  width: auto;
}

.footer-menu-section {
  display: flex;
  flex-direction: column;
  gap: 32px;
}

.footer-title {
  font-size: 24px;
  font-weight: 600;
  color: #000;
  margin: 0;
  font-family: 'Sora', sans-serif;
}

.menu-columns {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 60px;
}

.menu-column {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.menu-link {
  color: #000;
  text-decoration: none;
  font-size: 18px;
  font-weight: 600;
  font-family: 'Sora', sans-serif;
  transition: all 0.3s ease;
  position: relative;
  display: inline-block;
  padding-right: 20px;
}

.menu-link::before {
  content: '';
  position: absolute;
  bottom: -4px;
  left: 0;
  width: 0;
  height: 2px;
  background-color: #000;
  transition: width 0.3s ease;
}

.menu-link::after {
  content: '';
  position: absolute;
  right: 0;
  top: 50%;
  transform: translateY(-50%);
  width: 10px;
  height: 10px;
  background-color: #000;
  border-radius: 50%;
  opacity: 0;
  transition: opacity 0.3s ease;
}

.menu-link:hover::before {
  width: calc(100% - 10px);
}

.menu-link:hover::after {
  opacity: 1;
}

.footer-contact-section {
  display: flex;
  flex-direction: column;
  gap: 32px;
}

.contact-info {
  display: flex;
  flex-direction: column;
  gap: 32px;
}

.footer-address {
  font-size: 18px;
  line-height: 1.8;
  color: #000;
  font-family: 'Sora', sans-serif;
  margin: 0;
}

.social-links {
  display: flex;
  gap: 16px;
  align-items: center;
}

.social-icon {
  width: 32px;
  height: 32px;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
}

.social-icon:hover {
  transform: translateY(-2px);
}

.social-icon img {
  width: 100%;
  height: 100%;
  object-fit: contain;
}

/* 微信二维码样式 */
.wx-icon {
  position: relative;
}

.wx-qrcode {
  position: absolute;
  bottom: 45px;
  left: 50%;
  transform: translateX(-50%);
  opacity: 0;
  visibility: hidden;
  transition: all 0.3s ease;
  background: white;
  border-radius: 8px;
  padding: 8px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
  z-index: 1000;
  width: 216px;
  height: 216px;
}

.wx-qrcode::before {
  content: '';
  position: absolute;
  top: 100%;
  left: 50%;
  transform: translateX(-50%);
  border: 6px solid transparent;
  border-top-color: white;
}

.wx-qrcode img {
  width: 200px !important;
  height: 200px !important;
  display: block !important;
  object-fit: cover !important;
}

.wx-icon:hover .wx-qrcode {
  opacity: 1;
  visibility: visible;
}

/* 兼容移动端点击展开 */
.wx-icon.active .wx-qrcode {
  opacity: 1;
  visibility: visible;
}

/* 响应式设计 */
@media (max-width: 1600px) {
  .container {
    padding: 0 30px;
  }

  .footer-title {
    font-size: 22px;
  }

  .menu-link,
  .footer-address {
    font-size: 16px;
  }

  .footer-content {
    gap: 100px;
  }
}

@media (max-width: 1400px) {
  .container {
    padding: 0 30px;
  }

  .footer-title {
    font-size: 20px;
  }

  .menu-link,
  .footer-address {
    font-size: 16px;
  }

  .footer-content {
    gap: 80px;
  }
}

@media (max-width: 1024px) {
  .container {
    padding: 0 20px;
  }

  .footer-content {
    grid-template-columns: 1fr 1fr;
    gap: 60px;
  }

  .footer-contact-section {
    grid-column: 1 / -1;
  }
}

@media (max-width: 768px) {

  .footer .container {
    padding: 0 16px;
  }

  .footer-content {
    grid-template-columns: 1fr;
    gap: 32px;
  }

  .footer-logo-section {
    text-align: center;
  }

  .footer-logo-icon {
    height: 48px;
  }

  .footer-title {
    font-size: 18px;
    margin-bottom: 16px;
  }

  .menu-columns {
    display: flex;
    flex-wrap: wrap;
    gap: 12px 20px;
    justify-content: flex-start;
  }

  .menu-column {
    gap: 12px;
    flex: 0 0 calc(50% - 10px);
  }

  .menu-link {
    font-size: 15px;
    display: block;
    padding: 8px 0;
  }

  .footer-address {
    font-size: 14px;
    line-height: 1.6;
    text-align: left;
  }

  .contact-info {
    gap: 20px;
  }

  .social-links {
    gap: 16px;
    justify-content: flex-start;
  }

  .social-icon {
    width: 32px;
    height: 32px;
  }
}

@media (max-width: 480px) {
  .container {
    padding: 0 12px;
  }

  .footer-content {
    gap: 24px;
  }

  .footer-logo-icon {
    height: 40px;
  }

  .footer-title {
    font-size: 16px;
    margin-bottom: 12px;
  }

  .menu-columns {
    gap: 8px 16px;
  }

  .menu-column {
    flex: 0 0 calc(50% - 8px);
  }

  .menu-link {
    font-size: 14px;
    padding: 6px 0;
  }

  .footer-address {
    font-size: 13px;
    line-height: 1.5;
  }

  .contact-info {
    gap: 16px;
  }

  .social-links {
    gap: 12px;
  }

  .social-icon {
    width: 28px;
    height: 28px;
  }
}
</style>