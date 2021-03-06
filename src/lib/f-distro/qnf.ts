/*  AUTHOR
 *  Jacob Bogers, jkfbogers@gmail.com
 *  March 19, 2017
 *
 *  ORIGINAL AUTHOR
 *  R : A Computer Language for Statistical Data Analysis
 *  Copyright (C) 2006-8 The R Core Team
 *
 *  This program is free software; you can redistribute it and/or modify
 *  it under the terms of the GNU General Public License as published by
 *  the Free Software Foundation; either version 2 of the License, or
 *  (at your option) any later version.
 *
 *  This program is distributed in the hope that it will be useful,
 *  but WITHOUT ANY WARRANTY; without even the implied warranty of
 *  MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 *  GNU General Public License for more details.
 *
 *  You should have received a copy of the GNU General Public License
 *  along with this program; if not, a copy is available at
 *  https://www.R-project.org/Licenses/
 * 
 *   	The quantile function of the non-central F distribution.
 * 
 * 
 */

import * as debug from 'debug';

import { ML_ERR_return_NAN, R_Q_P01_boundaries } from '../common/_general';


import { qnbeta } from '../beta/qnbeta';
import { qnchisq } from '../chi-2/qnchisq';

const {
  isNaN: ISNAN,
  isFinite: R_FINITE,
  POSITIVE_INFINITY: ML_POSINF
} = Number;

const printer = debug('qnf');

export function qnf<T>(
  pp: T,
  df1: number,
  df2: number,
  ncp: number,
  lowerTail: boolean = true,
  logP: boolean = false
): T {
  const fp: number[] = Array.isArray(pp) ? pp : ([pp] as any);

  const result = fp.map(p => {
    let y;

    if (ISNAN(p) || ISNAN(df1) || ISNAN(df2) || ISNAN(ncp))
      return p + df1 + df2 + ncp;

    switch (true) {
      case df1 <= 0 || df2 <= 0 || ncp < 0:
      case !R_FINITE(ncp):
      case !R_FINITE(df1) && !R_FINITE(df2):
        return ML_ERR_return_NAN(printer);
      default:
        // pass through
        break;
    }
    //if (df1 <= 0 || df2 <= 0 || ncp < 0) ML_ERR_return_NAN(printer);
    //if (!R_FINITE(ncp)) ML_ERR_return_NAN;
    //if (!R_FINITE(df1) && !R_FINITE(df2)) ML_ERR_return_NAN;
    let rc = R_Q_P01_boundaries(lowerTail, logP, p, 0, ML_POSINF);
    if (rc !== undefined) {
      return rc;
    }

    if (df2 > 1e8)
      /* avoid problems with +Inf and loss of accuracy */
      return qnchisq(p, df1, ncp, lowerTail, logP) / df1;

    y = qnbeta(p, df1 / 2, df2 / 2, ncp, lowerTail, logP);
    return y / (1 - y) * (df2 / df1);
  });
  return result.length === 1 ? result[0] : result as any;
}
