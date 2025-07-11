/*
 * SatsLab - Free and Open Source Bitcoin Education Platform
 * Copyright (c) 2025 SatsLab
 * 
 * This file is part of SatsLab.
 * 
 * SatsLab is free software: you can redistribute it and/or modify
 * it under the terms of the MIT License as published in the LICENSE file.
 * 
 * SatsLab is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
 * MIT License for more details.
 */

import HomePage from '@/app/components/HomePage'
import PortugueseWrapper from '@/app/components/i18n/PortugueseWrapper'

export default function Page() {
  return (
    <PortugueseWrapper>
      <HomePage />
    </PortugueseWrapper>
  )
}