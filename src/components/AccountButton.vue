<template>
  <div>
    <span v-if="isAuthorized">{{ nickname }}</span>
    <span v-else>Log in</span>
  </div>
</template>

<script setup lang="ts">
import useAccount from '@/composables/useAccount';

const { isAuthorized, nickname } = useAccount();
</script>
